"""
Cloud Tasks service for scheduling bookmark reminders.

Provides functions to schedule individual bookmark reminder notifications
using Google Cloud Tasks.
"""

import json
import logging
import os
from datetime import datetime, timezone

from google.cloud import tasks_v2
from google.protobuf import timestamp_pb2

logger = logging.getLogger(__name__)


class TasksService:
    """Service for creating Cloud Tasks."""

    _client: tasks_v2.CloudTasksClient | None = None
    _project: str | None = None
    _location: str | None = None
    _queue: str = "bookmark-reminders"
    _backend_url: str | None = None

    @classmethod
    def initialize(cls) -> None:
        """Initialize the Cloud Tasks client."""
        if cls._client is not None:
            return

        cls._project = os.getenv("GCP_PROJECT_ID")
        cls._location = os.getenv("GCP_REGION", "us-central1")
        cls._backend_url = os.getenv("BACKEND_URL")

        if not cls._project:
            logger.warning("GCP_PROJECT_ID not set, Cloud Tasks disabled")
            return

        if not cls._backend_url:
            logger.warning("BACKEND_URL not set, Cloud Tasks disabled")
            return

        try:
            cls._client = tasks_v2.CloudTasksClient()
            logger.info(f"Cloud Tasks initialized for project {cls._project}")
        except Exception as e:
            logger.error(f"Failed to initialize Cloud Tasks: {e}")

    @classmethod
    def is_enabled(cls) -> bool:
        """Check if Cloud Tasks is enabled and configured."""
        return cls._client is not None and cls._backend_url is not None

    @classmethod
    def schedule_bookmark_reminder(
        cls,
        user_id: str,
        bookmark_id: str,
        schedule_time: datetime,
    ) -> str | None:
        """
        Schedule a reminder notification for a bookmark.

        Args:
            user_id: The user's Firebase UID
            bookmark_id: The bookmark document ID
            schedule_time: When to send the reminder

        Returns:
            Task name if created, None if failed or disabled
        """
        cls.initialize()

        if not cls.is_enabled():
            logger.debug("Cloud Tasks not enabled, skipping task creation")
            return None

        try:
            # Build the queue path
            queue_path = cls._client.queue_path(cls._project, cls._location, cls._queue)

            # Create the request payload
            payload = {
                "user_id": user_id,
                "bookmark_id": bookmark_id,
            }

            # Build the task
            task = {
                "http_request": {
                    "http_method": tasks_v2.HttpMethod.POST,
                    "url": f"{cls._backend_url}/notifications/send-bookmark-reminder",
                    "headers": {"Content-Type": "application/json"},
                    "body": json.dumps(payload).encode(),
                    "oidc_token": {
                        "service_account_email": os.getenv(
                            "SCHEDULER_SERVICE_ACCOUNT",
                            f"scheduler-sa@{cls._project}.iam.gserviceaccount.com",
                        ),
                        "audience": cls._backend_url,
                    },
                },
            }

            # Set schedule time
            if schedule_time > datetime.now(timezone.utc):
                timestamp = timestamp_pb2.Timestamp()
                timestamp.FromDatetime(schedule_time)
                task["schedule_time"] = timestamp

            # Create the task
            response = cls._client.create_task(
                request={"parent": queue_path, "task": task}
            )

            logger.info(f"Created task: {response.name}")
            return response.name

        except Exception as e:
            logger.error(f"Failed to create Cloud Task: {e}")
            return None

    @classmethod
    def delete_bookmark_tasks(cls, user_id: str, bookmark_id: str) -> int:
        """
        Delete all pending tasks for a bookmark.

        Call this when a bookmark is marked as read or deleted.

        Args:
            user_id: The user's Firebase UID
            bookmark_id: The bookmark document ID

        Returns:
            Number of tasks deleted
        """
        cls.initialize()

        if not cls.is_enabled():
            return 0

        # Note: Cloud Tasks doesn't support querying by payload content
        # For production, you'd store task names in Firestore with the bookmark
        # For now, we rely on the task checking if bookmark is read before sending
        logger.debug(
            "Task deletion not implemented - tasks will check read status at execution"
        )
        return 0


def get_tasks_service() -> type[TasksService]:
    """Get the Tasks service."""
    TasksService.initialize()
    return TasksService
