import os

from dotenv import load_dotenv


load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")


if (
    not SUPABASE_URL
    or not SUPABASE_PUBLISHABLE_KEY
    or not SUPABASE_SECRET_KEY
):
    raise RuntimeError("Supabase environment variables are missing")