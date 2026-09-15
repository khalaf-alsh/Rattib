import { createClient } from "@supabase/supabase-js";

// Public Supabase configuration provided through the frontend environment.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Shared browser client used for authentication and user-scoped
// Supabase operations throughout the frontend.
export const supabase = createClient(supabaseUrl, supabasePublishableKey);
