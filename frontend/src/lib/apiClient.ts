import { supabase } from "./supabaseClient";

// Base URL of the FastAPI backend for the current environment.
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL is missing");
}

// Shared API helper that automatically attaches the authenticated
// user's Supabase access token to backend requests.
export async function apiFetch(path: string, options: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected backend endpoints require an active Supabase session.
  if (!session) {
    throw new Error("User is not authenticated");
  }

  // Preserve any caller-provided headers before adding authentication.
  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${session.access_token}`);

  // JSON is the default request format used by Ratteb's API.
  // Keep an explicitly provided Content-Type unchanged.
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
}
