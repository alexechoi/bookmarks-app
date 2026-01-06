"""
Bookmark management API routes.

Provides CRUD operations for user bookmarks with URL metadata fetching.
Bookmarks are stored as subcollections under /users/{userId}/bookmarks/
"""

import logging
import re
from datetime import datetime, timedelta, timezone
from typing import Literal, Optional
from urllib.parse import urljoin, urlparse

import httpx
from fastapi import APIRouter, HTTPException
from firebase_admin import firestore
from pydantic import BaseModel, HttpUrl

from auth import FirebaseUser
from firebase_service import get_firebase_service
from tasks import get_tasks_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])

# Types
# NOTE: "3s" is for testing only - remove in production
ReminderInterval = Literal["3s", "1d", "3d", "1w", "1m"]


def get_db():
    """Get Firestore client from Firebase service (lazy initialization)."""
    return get_firebase_service().get_firestore_client()


class BookmarkCreate(BaseModel):
    """Request body for creating a bookmark."""

    url: HttpUrl
    reminder_interval: ReminderInterval = "1d"


class BookmarkUpdate(BaseModel):
    """Request body for updating a bookmark."""

    is_read: Optional[bool] = None
    reminder_interval: Optional[ReminderInterval] = None


class BookmarkResponse(BaseModel):
    """Response body for a bookmark."""

    id: str
    url: str
    title: str
    description: str
    favicon: str
    reminder_interval: ReminderInterval
    next_reminder_at: datetime
    is_read: bool
    created_at: datetime
    updated_at: datetime


def get_bookmarks_collection(user_id: str):
    """Get the bookmarks subcollection reference for a user."""
    db = get_db()
    return db.collection("users").document(user_id).collection("bookmarks")


def get_bookmark_doc(user_id: str, bookmark_id: str):
    """Get a bookmark document reference."""
    db = get_db()
    return (
        db.collection("users")
        .document(user_id)
        .collection("bookmarks")
        .document(bookmark_id)
    )


def calculate_next_reminder(interval: ReminderInterval) -> datetime:
    """Calculate the next reminder date based on the interval."""
    now = datetime.now(timezone.utc)
    intervals = {
        "3s": timedelta(seconds=3),  # Testing only
        "1d": timedelta(days=1),
        "3d": timedelta(days=3),
        "1w": timedelta(weeks=1),
        "1m": timedelta(days=30),
    }
    return now + intervals.get(interval, timedelta(days=1))


async def fetch_url_metadata(url: str) -> dict:
    """
    Fetch metadata (title, description, favicon) from a URL.

    Returns a dict with title, description, and favicon fields.
    """
    metadata = {
        "title": url,
        "description": "",
        "favicon": "",
    }

    try:
        async with httpx.AsyncClient(
            timeout=10.0,
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; LinkMind/1.0; +https://linkmind.app)"
            },
        ) as client:
            response = await client.get(url)
            response.raise_for_status()

            html = response.text
            parsed_url = urlparse(url)
            base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"

            # Extract title
            title_match = re.search(r"<title[^>]*>([^<]+)</title>", html, re.IGNORECASE)
            if title_match:
                metadata["title"] = title_match.group(1).strip()

            # Try to get og:title if regular title is not found or generic
            og_title_match = re.search(
                r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']',
                html,
                re.IGNORECASE,
            )
            if not og_title_match:
                og_title_match = re.search(
                    r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:title["\']',
                    html,
                    re.IGNORECASE,
                )
            if og_title_match:
                metadata["title"] = og_title_match.group(1).strip()

            # Extract description
            desc_match = re.search(
                r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']',
                html,
                re.IGNORECASE,
            )
            if not desc_match:
                desc_match = re.search(
                    r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']description["\']',
                    html,
                    re.IGNORECASE,
                )
            if desc_match:
                metadata["description"] = desc_match.group(1).strip()[:500]

            # Try og:description as fallback
            if not metadata["description"]:
                og_desc_match = re.search(
                    r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"\']+)["\']',
                    html,
                    re.IGNORECASE,
                )
                if not og_desc_match:
                    og_desc_match = re.search(
                        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:description["\']',
                        html,
                        re.IGNORECASE,
                    )
                if og_desc_match:
                    metadata["description"] = og_desc_match.group(1).strip()[:500]

            # Extract favicon
            # First try link rel="icon"
            favicon_match = re.search(
                r'<link[^>]+rel=["\'](?:shortcut )?icon["\'][^>]+href=["\']([^"\']+)["\']',
                html,
                re.IGNORECASE,
            )
            if not favicon_match:
                favicon_match = re.search(
                    r'<link[^>]+href=["\']([^"\']+)["\'][^>]+rel=["\'](?:shortcut )?icon["\']',
                    html,
                    re.IGNORECASE,
                )

            if favicon_match:
                favicon_url = favicon_match.group(1).strip()
                if favicon_url.startswith("//"):
                    favicon_url = f"{parsed_url.scheme}:{favicon_url}"
                elif favicon_url.startswith("/"):
                    favicon_url = urljoin(base_url, favicon_url)
                elif not favicon_url.startswith("http"):
                    favicon_url = urljoin(url, favicon_url)
                metadata["favicon"] = favicon_url
            else:
                # Try default favicon location
                metadata["favicon"] = f"{base_url}/favicon.ico"

    except Exception as e:
        logger.warning(f"Failed to fetch metadata for {url}: {e}")

    return metadata


@router.post("", response_model=BookmarkResponse)
async def create_bookmark(bookmark: BookmarkCreate, user: FirebaseUser):
    """
    Create a new bookmark for the authenticated user.

    Automatically fetches URL metadata (title, description, favicon).
    Stored at: /users/{userId}/bookmarks/{bookmarkId}
    """
    user_id = user["uid"]
    url_str = str(bookmark.url)

    # Fetch metadata asynchronously
    metadata = await fetch_url_metadata(url_str)

    now = datetime.now(timezone.utc)
    next_reminder = calculate_next_reminder(bookmark.reminder_interval)

    bookmark_data = {
        "url": url_str,
        "title": metadata["title"],
        "description": metadata["description"],
        "favicon": metadata["favicon"],
        "reminderInterval": bookmark.reminder_interval,
        "nextReminderAt": next_reminder,
        "isRead": False,
        "createdAt": now,
        "updatedAt": now,
    }

    # Add to Firestore under user's bookmarks subcollection
    doc_ref = get_bookmarks_collection(user_id).add(bookmark_data)
    bookmark_id = doc_ref[1].id

    # Schedule the reminder notification using Cloud Tasks
    tasks = get_tasks_service()
    if tasks.is_enabled():
        tasks.schedule_bookmark_reminder(
            user_id=user_id,
            bookmark_id=bookmark_id,
            schedule_time=next_reminder,
        )
        logger.info(f"Scheduled reminder for bookmark {bookmark_id} at {next_reminder}")
    else:
        logger.debug("Cloud Tasks not enabled, reminder will be sent via scheduled job")

    return BookmarkResponse(
        id=bookmark_id,
        url=url_str,
        title=metadata["title"],
        description=metadata["description"],
        favicon=metadata["favicon"],
        reminder_interval=bookmark.reminder_interval,
        next_reminder_at=next_reminder,
        is_read=False,
        created_at=now,
        updated_at=now,
    )


@router.get("", response_model=list[BookmarkResponse])
async def list_bookmarks(user: FirebaseUser, unread_only: bool = False):
    """
    List all bookmarks for the authenticated user.

    Args:
        unread_only: If True, only return unread bookmarks.
    """
    user_id = user["uid"]
    query = get_bookmarks_collection(user_id)

    if unread_only:
        query = query.where("isRead", "==", False)

    query = query.order_by("createdAt", direction=firestore.Query.DESCENDING)

    docs = query.stream()

    bookmarks = []
    for doc in docs:
        data = doc.to_dict()
        bookmarks.append(
            BookmarkResponse(
                id=doc.id,
                url=data["url"],
                title=data.get("title", data["url"]),
                description=data.get("description", ""),
                favicon=data.get("favicon", ""),
                reminder_interval=data["reminderInterval"],
                next_reminder_at=data["nextReminderAt"],
                is_read=data["isRead"],
                created_at=data["createdAt"],
                updated_at=data["updatedAt"],
            )
        )

    return bookmarks


@router.patch("/{bookmark_id}", response_model=BookmarkResponse)
async def update_bookmark(
    bookmark_id: str, updates: BookmarkUpdate, user: FirebaseUser
):
    """
    Update a bookmark (mark as read, change reminder interval).
    """
    user_id = user["uid"]
    doc_ref = get_bookmark_doc(user_id, bookmark_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    update_data = {"updatedAt": datetime.now(timezone.utc)}
    tasks = get_tasks_service()

    if updates.is_read is not None:
        update_data["isRead"] = updates.is_read
        # If marking as read, delete the pending reminder task
        if updates.is_read and tasks.is_enabled():
            tasks.delete_bookmark_reminder(user_id, bookmark_id)
            logger.info(f"Deleted reminder task for read bookmark {bookmark_id}")

    if updates.reminder_interval is not None:
        update_data["reminderInterval"] = updates.reminder_interval
        next_reminder = calculate_next_reminder(updates.reminder_interval)
        update_data["nextReminderAt"] = next_reminder

        # Delete old task and create new one with updated schedule
        if tasks.is_enabled():
            tasks.delete_bookmark_reminder(user_id, bookmark_id)
            tasks.schedule_bookmark_reminder(user_id, bookmark_id, next_reminder)
            logger.info(
                f"Rescheduled reminder for bookmark {bookmark_id} to {next_reminder}"
            )

    doc_ref.update(update_data)

    # Get updated document
    updated_doc = doc_ref.get()
    updated_data = updated_doc.to_dict()

    return BookmarkResponse(
        id=doc.id,
        url=updated_data["url"],
        title=updated_data.get("title", updated_data["url"]),
        description=updated_data.get("description", ""),
        favicon=updated_data.get("favicon", ""),
        reminder_interval=updated_data["reminderInterval"],
        next_reminder_at=updated_data["nextReminderAt"],
        is_read=updated_data["isRead"],
        created_at=updated_data["createdAt"],
        updated_at=updated_data["updatedAt"],
    )


@router.delete("/{bookmark_id}")
async def delete_bookmark(bookmark_id: str, user: FirebaseUser):
    """
    Delete a bookmark and its pending reminder task.
    """
    user_id = user["uid"]
    doc_ref = get_bookmark_doc(user_id, bookmark_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    # Delete any pending reminder task
    tasks = get_tasks_service()
    if tasks.is_enabled():
        tasks.delete_bookmark_reminder(user_id, bookmark_id)
        logger.info(f"Deleted reminder task for deleted bookmark {bookmark_id}")

    doc_ref.delete()

    return {"message": "Bookmark deleted"}
