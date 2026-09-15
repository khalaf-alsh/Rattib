import { apiFetch } from "../lib/apiClient";

// Permanently deletes the authenticated account through the backend.
// Related user data is removed by the database ON DELETE CASCADE rules.
export async function deleteAccount(): Promise<void> {
  const response = await apiFetch("/api/account", {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete account");
  }
}
