from pydantic import BaseModel


# Request model for storing a browser Web Push subscription.
class PushSubscriptionInput(BaseModel):
    endpoint: str
    p256dh: str
    auth: str