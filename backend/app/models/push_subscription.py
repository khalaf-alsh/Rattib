from pydantic import BaseModel


class PushSubscriptionInput(BaseModel):
    endpoint: str
    p256dh: str
    auth: str