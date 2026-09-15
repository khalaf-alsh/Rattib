import { apiFetch } from "../lib/apiClient";

type LegalAcceptanceStatus = {
  accepted: boolean;
};

// Check whether the current user accepted the active legal versions.
export async function getLegalAcceptanceStatus(): Promise<boolean> {
  const response = await apiFetch("/api/legal-acceptance");

  if (!response.ok) {
    throw new Error("Failed to check legal acceptance");
  }

  const data: LegalAcceptanceStatus = await response.json();

  return data.accepted;
}

// Record acceptance of the current Terms and Privacy Policy.
export async function acceptLegalDocuments(): Promise<void> {
  const response = await apiFetch("/api/legal-acceptance", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to save legal acceptance");
  }
}
