import os

from dotenv import load_dotenv


# Load local environment variables from the backend .env file.
load_dotenv()


# Supabase configuration used by both user-scoped and
# privileged server-side clients.
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")


# Read the comma-separated frontend origins allowed to call the API.
FRONTEND_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
    if origin.strip()
]


# Fail immediately during application startup if any required
# environment variable is missing.
if (
    not SUPABASE_URL
    or not SUPABASE_PUBLISHABLE_KEY
    or not SUPABASE_SECRET_KEY
    or not FRONTEND_ORIGINS
):
    raise RuntimeError("Required environment variables are missing")