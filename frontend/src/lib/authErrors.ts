// Convert Supabase Auth errors into translation keys that can be
// displayed consistently across login and registration screens.
export function authErrorKey(
  error: unknown,
  fallback: "loginFailed" | "registrationFailed",
): string {
  if (!error || typeof error !== "object") return fallback;

  const { code, status } = error as { code?: string; status?: number };

  // Group all request, email, and SMS rate-limit responses
  // under one user-facing message.
  if (
    status === 429 ||
    code === "over_request_rate_limit" ||
    code === "over_email_send_rate_limit" ||
    code === "over_sms_send_rate_limit"
  )
    return "authErrors.rateLimit";

  // Map known Supabase Auth error codes to localized messages
  // and fall back to the page-specific generic error otherwise.
  switch (code) {
    case "email_not_confirmed":
      return "authErrors.notVerified";
    case "email_exists":
    case "user_already_exists":
      return "authErrors.emailExists";
    case "invalid_credentials":
      return "authErrors.invalidCredentials";
    case "weak_password":
      return "passwordRules.minLength";
    default:
      return fallback;
  }
}
