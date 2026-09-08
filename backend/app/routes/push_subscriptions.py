import httpx

from fastapi import APIRouter, Depends, HTTPException

from app.config import SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY
from app.dependencies.auth import get_authenticated_user
from app.models.push_subscription import PushSubscriptionInput


router = APIRouter(
    prefix="/api/push-subscriptions",
    tags=["Push Subscriptions"],
)


@router.post("", status_code=201)
async def save_push_subscription(
    subscription: PushSubscriptionInput,
    auth=Depends(get_authenticated_user),
):
    access_token, user = auth

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation",
    }

    subscription_data = {
        "user_id": user.id,
        "endpoint": subscription.endpoint,
        "p256dh": subscription.p256dh,
        "auth": subscription.auth,
    }

    params = {
        "on_conflict": "user_id,endpoint",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SUPABASE_URL}/rest/v1/push_subscriptions",
            headers=headers,
            params=params,
            json=subscription_data,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail="Failed to save push subscription",
        )

    rows = response.json()

    if not rows:
        raise HTTPException(
            status_code=500,
            detail="Push subscription was not returned",
        )

    return rows[0]


@router.delete("", status_code=204)
async def delete_push_subscription(
    endpoint: str,
    auth=Depends(get_authenticated_user),
):
    access_token, _ = auth

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {access_token}",
        "Prefer": "return=representation",
    }

    params = {
        "endpoint": f"eq.{endpoint}",
    }

    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"{SUPABASE_URL}/rest/v1/push_subscriptions",
            headers=headers,
            params=params,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail="Failed to delete push subscription",
        )