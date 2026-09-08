export function authErrorKey(error: unknown, fallback: "loginFailed" | "registrationFailed"): string {
  if (!error || typeof error !== "object") return fallback;
  const { code, status } = error as { code?: string; status?: number };
  if (status === 429 || code === "over_request_rate_limit" || code === "over_email_send_rate_limit" || code === "over_sms_send_rate_limit") return "authErrors.rateLimit";
  switch (code) {
    case "email_not_confirmed": return "authErrors.notVerified";
    case "email_exists":
    case "user_already_exists": return "authErrors.emailExists";
    case "invalid_credentials": return "authErrors.invalidCredentials";
    default: return fallback;
  }
}
