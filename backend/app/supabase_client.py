from supabase import Client, create_client

from app.config import (
    SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY,
    SUPABASE_URL,
)


# Regular client used for authenticated user operations that still respect RLS.
supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
)


# Privileged server-only client used for administrative Auth operations.
# Never expose this client or its secret key to the frontend.
supabase_admin: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SECRET_KEY,
)