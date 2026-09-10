from fastapi import APIRouter, Depends, HTTPException, Response

from app.dependencies.auth import get_authenticated_user
from app.supabase_client import supabase_admin


router = APIRouter(
    prefix="/api",
    tags=["Auth"],
)


@router.get("/me")
def get_current_user(
    auth=Depends(get_authenticated_user),
):
    _, user = auth

    return {
        "id": user.id,
        "email": user.email,
    }


@router.delete("/account", status_code=204)
def delete_account(
    auth=Depends(get_authenticated_user),
):
    _, user = auth

    try:
        # Permanently delete the authenticated Supabase Auth user.
        # Database foreign keys use ON DELETE CASCADE, so the user's
        # courses, meetings, daily tasks, and push subscriptions are
        # removed automatically by PostgreSQL.
        supabase_admin.auth.admin.delete_user(str(user.id))
    except Exception as error:
        print(f"Failed to delete account {user.id}: {error}")

        raise HTTPException(
            status_code=500,
            detail="Unable to delete account",
        ) from error

    return Response(status_code=204)