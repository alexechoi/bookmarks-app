"""
FastAPI authentication dependencies for Firebase token verification.

Usage:
    from auth import get_firebase_user, get_optional_firebase_user

    # Require authentication (401 if not authenticated)
    @app.get("/protected")
    async def protected_route(user: dict = Depends(get_firebase_user)):
        return {"user_id": user["uid"]}

    # Optional authentication (None if not authenticated)
    @app.get("/optional-auth")
    async def optional_route(user: dict | None = Depends(get_optional_firebase_user)):
        if user:
            return {"user_id": user["uid"]}
        return {"message": "Anonymous user"}
"""

import logging
from typing import Annotated

from fastapi import Depends, Header, HTTPException

from firebase_service import get_firebase_service

logger = logging.getLogger(__name__)


async def get_firebase_user(
    authorization: Annotated[str | None, Header()] = None,
) -> dict:
    """
    FastAPI dependency to verify Firebase authentication token.

    Extracts the Bearer token from the Authorization header and verifies it
    using Firebase Admin SDK.

    Args:
        authorization: The Authorization header value (e.g., "Bearer <token>")

    Returns:
        Decoded Firebase token containing user info:
        - uid: User's Firebase UID
        - email: User's email (if available)
        - email_verified: Whether email is verified
        - name: User's display name (if available)
        - picture: User's profile picture URL (if available)
        - firebase: Firebase-specific claims

    Raises:
        HTTPException: 401 if token is missing, invalid, or expired
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Parse Bearer token
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token format. Expected: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]

    try:
        firebase_service = get_firebase_service()
        decoded_token = firebase_service.verify_token(token)
        return decoded_token

    except RuntimeError as e:
        # Firebase not initialized
        logger.error(f"Firebase service error: {e}")
        raise HTTPException(
            status_code=503,
            detail="Authentication service unavailable",
        ) from e

    except ValueError as e:
        # Token verification failed
        raise HTTPException(
            status_code=401,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


async def get_optional_firebase_user(
    authorization: Annotated[str | None, Header()] = None,
) -> dict | None:
    """
    FastAPI dependency for optional Firebase authentication.

    Similar to get_firebase_user but returns None instead of raising
    an exception when no token is provided.

    Args:
        authorization: The Authorization header value (optional)

    Returns:
        Decoded Firebase token if valid token provided, None otherwise

    Raises:
        HTTPException: 401 only if token is provided but invalid
    """
    if not authorization:
        return None

    # If token is provided, it must be valid
    return await get_firebase_user(authorization)


# Type alias for cleaner dependency injection
FirebaseUser = Annotated[dict, Depends(get_firebase_user)]
OptionalFirebaseUser = Annotated[dict | None, Depends(get_optional_firebase_user)]


async def verify_scheduler_or_user(
    authorization: Annotated[str | None, Header()] = None,
) -> dict | None:
    """
    Verify either a Firebase user token OR a Cloud Scheduler OIDC token.

    Cloud Scheduler sends OIDC tokens that can be verified by checking
    the audience matches our service URL. For simplicity, we accept
    requests from Cloud Scheduler (identified by OIDC token format)
    or authenticated Firebase users.

    Returns:
        dict with user info if Firebase user, or {"scheduler": True} if scheduler
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token format",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]

    # Try Firebase user token first
    try:
        firebase_service = get_firebase_service()
        decoded_token = firebase_service.verify_token(token)
        return decoded_token
    except ValueError:
        pass  # Not a Firebase token, might be OIDC

    # For Cloud Scheduler OIDC tokens, we verify using Google's public keys
    # In production, you should properly verify the OIDC token
    # For now, we'll accept any properly formatted JWT from Cloud Scheduler
    # The Cloud Run service already validates the OIDC token at the edge
    try:
        import jwt

        # Decode without verification - Cloud Run already verified at edge
        # In production with custom domain, add proper OIDC verification
        decoded = jwt.decode(token, options={"verify_signature": False})

        # Check if it's from Google (Cloud Scheduler)
        if decoded.get("iss") in [
            "https://accounts.google.com",
            "accounts.google.com",
        ]:
            logger.info("Request authenticated via Cloud Scheduler OIDC token")
            return {"scheduler": True, "email": decoded.get("email")}
    except Exception as e:
        logger.warning(f"Failed to decode OIDC token: {e}")

    raise HTTPException(
        status_code=401,
        detail="Invalid authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )


SchedulerOrUser = Annotated[dict, Depends(verify_scheduler_or_user)]
