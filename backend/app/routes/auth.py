from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response

from app.dependencies.auth import get_authenticated_user
from app.supabase_client import supabase_admin


router = APIRouter(
    prefix="/api",
    tags=["Auth"],
)

# These versions identify the currently active legal documents.
# A version change requires users to accept the updated documents again.
TERMS_VERSION = "2026-09-11"
PRIVACY_VERSION = "2026-09-11"


# Return basic information for the currently authenticated user.
@router.get("/me")
def get_current_user(
    auth=Depends(get_authenticated_user),
):
    _, user = auth

    return {
        "id": user.id,
        "email": user.email,
    }


# Check whether the current user has accepted both
# active legal-document versions.
@router.get("/legal-acceptance")
def get_legal_acceptance(
    auth=Depends(get_authenticated_user),
):
    _, user = auth

    try:
        # Check whether the authenticated user has accepted
        # the currently active legal document versions.
        result = (
            supabase_admin
            .table("legal_acceptances")
            .select("id")
            .eq("user_id", str(user.id))
            .eq("terms_version", TERMS_VERSION)
            .eq("privacy_version", PRIVACY_VERSION)
            .limit(1)
            .execute()
        )

        return {
            "accepted": bool(result.data),
        }

    except Exception as error:
        print(
            f"Failed to check legal acceptance for {user.id}: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to check legal acceptance",
        ) from error


# Record acceptance of the currently active legal documents.
# Repeated requests remain safe because an existing record is reused.
@router.post("/legal-acceptance", status_code=204)
def accept_legal_documents(
    auth=Depends(get_authenticated_user),
):
    _, user = auth

    try:
        # Avoid inserting another acceptance record when the user
        # has already accepted these exact document versions.
        existing = (
            supabase_admin
            .table("legal_acceptances")
            .select("id")
            .eq("user_id", str(user.id))
            .eq("terms_version", TERMS_VERSION)
            .eq("privacy_version", PRIVACY_VERSION)
            .limit(1)
            .execute()
        )

        if existing.data:
            return Response(status_code=204)

        # Store one UTC timestamp for both documents so the
        # acceptance event has a consistent server-side time.
        accepted_at = datetime.now(timezone.utc).isoformat()

        # Legal acceptance is recorded server-side so users cannot
        # directly create or modify acceptance records from the frontend.
        (
            supabase_admin
            .table("legal_acceptances")
            .insert(
                {
                    "user_id": str(user.id),
                    "terms_version": TERMS_VERSION,
                    "terms_accepted_at": accepted_at,
                    "privacy_version": PRIVACY_VERSION,
                    "privacy_acknowledged_at": accepted_at,
                    "age_confirmed_18_plus": True,
                }
            )
            .execute()
        )

    except Exception as error:
        print(
            f"Failed to save legal acceptance for {user.id}: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to save legal acceptance",
        ) from error

    return Response(status_code=204)


# Permanently remove the currently authenticated account.
@router.delete("/account", status_code=204)
def delete_account(
    auth=Depends(get_authenticated_user),
):
    _, user = auth

    try:
        # Permanently delete the authenticated Supabase Auth user.
        # Database foreign keys use ON DELETE CASCADE, so related
        # Ratteb data is removed automatically by PostgreSQL.
        supabase_admin.auth.admin.delete_user(str(user.id))

    except Exception as error:
        print(f"Failed to delete account {user.id}: {error}")

        raise HTTPException(
            status_code=500,
            detail="Unable to delete account",
        ) from error

    return Response(status_code=204)