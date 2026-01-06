"""
Notifications Router

API endpoints for sending push notifications via Firebase Cloud Messaging.
Bookmark reminders are handled by Cloud Tasks - one task per bookmark.
"""

import logging
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from auth import FirebaseUser, SchedulerAuth
from firebase_service import get_firebase_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notifications", tags=["notifications"])


def get_db():
    """Get Firestore client from Firebase service (lazy initialization)."""
    return get_firebase_service().get_firestore_client()


class NotificationPayload(BaseModel):
    """Notification content to send."""

    title: str = Field(
        ..., description="Notification title", min_length=1, max_length=100
    )
    body: str = Field(
        ..., description="Notification body", min_length=1, max_length=500
    )
    data: dict[str, str] | None = Field(
        default=None,
        description="Optional custom data payload (key-value pairs of strings)",
    )


class SendNotificationResponse(BaseModel):
    """Response from sending a notification."""

    success_count: int
    failure_count: int
    message: str
    failed_tokens: list[str] | None = None


@router.post("/send", response_model=SendNotificationResponse)
async def send_notification_to_self(
    payload: NotificationPayload,
    user: FirebaseUser,
) -> dict[str, Any]:
    """
    Send a notification to the authenticated user's devices.
    """
    user_id = user.get("uid")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not found in token")

    firebase = get_firebase_service()

    result = firebase.send_to_user(
        user_id=user_id,
        title=payload.title,
        body=payload.body,
        data=payload.data,
    )

    if result.get("error"):
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send notification: {result.get('error')}",
        )

    return {
        "success_count": result.get("success_count", 0),
        "failure_count": result.get("failure_count", 0),
        "message": result.get("message", "Notification processed"),
        "failed_tokens": result.get("failed_tokens"),
    }


@router.post("/send/{user_id}", response_model=SendNotificationResponse)
async def send_notification_to_user(
    user_id: str,
    payload: NotificationPayload,
    _user: FirebaseUser,  # Require authentication
) -> dict[str, Any]:
    """
    Send a notification to a specific user's devices.
    Requires authentication.
    """
    firebase = get_firebase_service()

    result = firebase.send_to_user(
        user_id=user_id,
        title=payload.title,
        body=payload.body,
        data=payload.data,
    )

    if result.get("error"):
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send notification: {result.get('error')}",
        )

    return {
        "success_count": result.get("success_count", 0),
        "failure_count": result.get("failure_count", 0),
        "message": result.get("message", "Notification processed"),
        "failed_tokens": result.get("failed_tokens"),
    }


@router.post("/test")
async def test_notification(
    user: FirebaseUser,
) -> dict[str, Any]:
    """
    Send a test notification to the authenticated user.
    """
    user_id = user.get("uid")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not found in token")

    firebase = get_firebase_service()
    tokens = firebase.get_user_device_tokens(user_id)

    if not tokens:
        return {
            "success": False,
            "message": "No device tokens registered. Make sure the app has notification permissions.",
            "token_count": 0,
        }

    result = firebase.send_to_user(
        user_id=user_id,
        title="Test Notification",
        body="If you see this, push notifications are working!",
        data={"type": "test", "timestamp": str(int(__import__("time").time()))},
    )

    return {
        "success": result.get("success_count", 0) > 0,
        "message": result.get("message", "Test notification sent"),
        "token_count": len(tokens),
        "success_count": result.get("success_count", 0),
        "failure_count": result.get("failure_count", 0),
    }


class BookmarkReminderRequest(BaseModel):
    """Request to send a reminder for a specific bookmark."""

    user_id: str = Field(..., description="User's Firebase UID")
    bookmark_id: str = Field(..., description="Bookmark document ID")


@router.post("/send-bookmark-reminder")
async def send_bookmark_reminder(
    request: BookmarkReminderRequest,
    _auth: SchedulerAuth,  # Cloud Tasks OIDC token
) -> dict[str, Any]:
    """
    Send a one-time reminder notification for a specific bookmark.

    Called by Cloud Tasks. The task is automatically cleaned up after execution.
    No rescheduling - each bookmark gets exactly one reminder.
    """
    firebase = get_firebase_service()
    db = get_db()

    # Get the bookmark
    bookmark_ref = (
        db.collection("users")
        .document(request.user_id)
        .collection("bookmarks")
        .document(request.bookmark_id)
    )
    bookmark_doc = bookmark_ref.get()

    if not bookmark_doc.exists:
        logger.info(f"Bookmark {request.bookmark_id} not found (may have been deleted)")
        return {"success": False, "message": "Bookmark not found"}

    bookmark = bookmark_doc.to_dict()

    # Skip if already read
    if bookmark.get("isRead"):
        logger.info(f"Bookmark {request.bookmark_id} already read, skipping reminder")
        return {"success": False, "message": "Bookmark already read"}

    # Send notification
    title = "Time to read!"
    body = f"Check out: {bookmark.get('title', bookmark.get('url', 'your saved link'))}"

    result = firebase.send_to_user(
        user_id=request.user_id,
        title=title,
        body=body,
        data={
            "type": "bookmark_reminder",
            "bookmark_id": request.bookmark_id,
            "url": bookmark.get("url", ""),
        },
    )

    success = result.get("success_count", 0) > 0
    if success:
        logger.info(f"Sent reminder for bookmark {request.bookmark_id}")
    else:
        logger.warning(f"Failed to send reminder for bookmark {request.bookmark_id}")

    return {
        "success": success,
        "message": result.get("message", "Reminder processed"),
    }
