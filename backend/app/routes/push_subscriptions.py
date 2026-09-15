import httpx

from fastapi import APIRouter, Depends, HTTPException

from app.config import SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY
from app.dependencies.auth import get_authenticated_user
from app.models.push_subscription import PushSubscriptionInput


router = APIRouter(
    prefix="/api/push-subscriptions",
    tags=["Push Subscriptions"],
)


# Save or refresh a Web Push subscription for the
# currently authenticated user.
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

        # Merge an existing row instead of creating a duplicate
        # when the same user and browser endpoint are registered again.
        "Prefer": "resolution=merge-duplicates,return=representation",
    }

    # Store the browser endpoint together with the encryption keys
    # required later when sending Web Push notifications.
    subscription_data = {
        "user_id": user.id,
        "endpoint": subscription.endpoint,
        "p256dh": subscription.p256dh,
        "auth": subscription.auth,
    }

    # The user/endpoint pair identifies one browser subscription
    # and is used by Supabase as the upsert conflict target.
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


# Remove a browser push endpoint when the user disables
# notifications on that device.
@router.delete("", status_code=204)
async def delete_push_subscription(
    endpoint: str,
    auth=Depends(get_authenticated_user),
):
    access_token, _ = auth

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,

        # The user's token keeps this request subject to
        # the push_subscriptions table's Row Level Security rules.
        "Authorization": f"Bearer {access_token}",
        "Prefer": "return=representation",
    }

    # Target the exact browser endpoint that is being unsubscribed.
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