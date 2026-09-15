from fastapi import Header, HTTPException

from app.supabase_client import supabase


# Authenticate protected API requests using the Supabase
# access token sent in the Authorization header.
def get_authenticated_user(
    authorization: str | None = Header(default=None),
):
    # Protected routes require an Authorization header.
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header is missing",
        )

    # Only standard Bearer authentication is accepted.
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header",
        )

    # Extract the raw Supabase access token from the header.
    access_token = authorization.removeprefix("Bearer ").strip()

    try:
        # Ask Supabase Auth to validate the token and return
        # the user associated with the current session.
        response = supabase.auth.get_user(access_token)
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    user = response.user

    # A valid token must resolve to an existing Supabase user.
    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    # Return both values because downstream routes need the user
    # identity and, in some cases, the original token for RLS requests.
    return access_token, user