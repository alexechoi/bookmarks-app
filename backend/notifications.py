"""
Notifications Router

API endpoints for sending push notifications via Firebase Cloud Messaging.
Includes bookmark reminder functionality.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from auth import FirebaseUser
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


class SendToUserRequest(BaseModel):
    """Request to send notification to a specific user."""

    user_id: str = Field(..., description="Target user's Firebase UID")
    notification: NotificationPayload


@router.post("/send", response_model=SendNotificationResponse)
async def send_notification_to_self(
    payload: NotificationPayload,
    user: FirebaseUser,
) -> dict[str, Any]:
    """
    Send a notification to the authenticated user's devices.

    This endpoint sends a push notification to all devices registered
    by the currently authenticated user.
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

    This endpoint can be used to send notifications to any user by their UID.
    Requires authentication. In production, you may want to add additional
    authorization checks (e.g., admin role).
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

    Useful for testing push notification setup.
    """
    user_id = user.get("uid")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not found in token")

    firebase = get_firebase_service()

    # Get token count for feedback
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


class ReminderResult(BaseModel):
    """Result of sending bookmark reminders."""

    users_notified: int
    bookmarks_reminded: int
    message: str


@router.post("/send-due-reminders", response_model=ReminderResult)
async def send_due_reminders(
    _user: FirebaseUser,  # Require authentication (should be service account or admin)
) -> dict[str, Any]:
    """
    Send reminders for all bookmarks that are due.

    This endpoint should be called by a scheduled job (e.g., Cloud Scheduler)
    to send daily reminders for bookmarks whose nextReminderAt has passed.

    It queries all users, then checks their bookmarks subcollection for unread
    bookmarks with nextReminderAt <= now, and sends a notification to each user.
    """
    firebase = get_firebase_service()
    db = get_db()
    now = datetime.now(timezone.utc)

    # Get all users
    users = db.collection("users").stream()

    users_notified = 0
    bookmarks_reminded = 0

    for user_doc in users:
        user_id = user_doc.id

        # Query bookmarks that are due for reminder for this user
        due_bookmarks = (
            db.collection("users")
            .document(user_id)
            .collection("bookmarks")
            .where("isRead", "==", False)
            .where("nextReminderAt", "<=", now)
            .stream()
        )

        bookmarks_list = []
        for doc in due_bookmarks:
            data = doc.to_dict()
            data["id"] = doc.id
            bookmarks_list.append(data)

        if not bookmarks_list:
            continue

        count = len(bookmarks_list)
        bookmarks_reminded += count

        # Compose notification message
        if count == 1:
            bookmark = bookmarks_list[0]
            title = "Time to read!"
            body = f"Check out: {bookmark.get('title', bookmark.get('url', 'your saved link'))}"
        else:
            title = f"You have {count} links to read!"
            body = "Open LinkMind to see your saved links"

        # Send notification
        result = firebase.send_to_user(
            user_id=user_id,
            title=title,
            body=body,
            data={
                "type": "bookmark_reminder",
                "count": str(count),
            },
        )

        if result.get("success_count", 0) > 0:
            users_notified += 1

        # Update nextReminderAt for each bookmark
        for bookmark in bookmarks_list:
            interval = bookmark.get("reminderInterval", "1d")
            intervals = {
                "1d": 1,
                "3d": 3,
                "1w": 7,
                "1m": 30,
            }
            days = intervals.get(interval, 1)
            next_reminder = datetime.now(timezone.utc).replace(
                hour=9, minute=0, second=0, microsecond=0
            )
            next_reminder += timedelta(days=days)

            (
                db.collection("users")
                .document(user_id)
                .collection("bookmarks")
                .document(bookmark["id"])
                .update({"nextReminderAt": next_reminder})
            )

    logger.info(
        f"Sent reminders to {users_notified} users for {bookmarks_reminded} bookmarks"
    )

    return {
        "users_notified": users_notified,
        "bookmarks_reminded": bookmarks_reminded,
        "message": f"Sent reminders to {users_notified} users for {bookmarks_reminded} bookmarks",
    }


@router.post("/send-daily-digest", response_model=ReminderResult)
async def send_daily_digest(
    _user: FirebaseUser,  # Require authentication (should be service account or admin)
) -> dict[str, Any]:
    """
    Send a daily digest of unread bookmarks to all users.

    This endpoint should be called once per day (e.g., at 9 AM)
    to remind users about any unread bookmarks they have.
    """
    firebase = get_firebase_service()
    db = get_db()

    # Get all users
    users = db.collection("users").stream()

    users_notified = 0
    total_bookmarks = 0

    for user_doc in users:
        user_id = user_doc.id

        # Count unread bookmarks for this user
        unread_bookmarks = (
            db.collection("users")
            .document(user_id)
            .collection("bookmarks")
            .where("isRead", "==", False)
            .stream()
        )

        count = sum(1 for _ in unread_bookmarks)

        if count == 0:
            continue

        total_bookmarks += count

        if count == 1:
            title = "You have 1 unread link"
            body = "Don't forget to check it out!"
        else:
            title = f"You have {count} unread links"
            body = "Take a moment to catch up on your reading list"

        result = firebase.send_to_user(
            user_id=user_id,
            title=title,
            body=body,
            data={
                "type": "daily_digest",
                "count": str(count),
            },
        )

        if result.get("success_count", 0) > 0:
            users_notified += 1

    logger.info(f"Sent daily digest to {users_notified} users")

    return {
        "users_notified": users_notified,
        "bookmarks_reminded": total_bookmarks,
        "message": f"Sent daily digest to {users_notified} users about {total_bookmarks} bookmarks",
    }
