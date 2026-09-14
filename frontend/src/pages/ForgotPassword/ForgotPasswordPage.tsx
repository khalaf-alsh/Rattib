import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";

import AuthPageControls from "../../components/auth/AuthPageControls";
import AuthCaptcha from "../../components/auth/AuthCaptcha";

import rattebIcon from "../../assets/ratteb-icon.png";

import "./ForgotPasswordPage.css";

function ForgotPasswordPage() {
  const { t } = useTranslation();

  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);

  usePageTitle("pageTitles.forgotPassword");

  // Resets Turnstile after an unsuccessful password reset request
  // because CAPTCHA tokens should only be submitted once.
  const resetCaptcha = () => {
    setCaptchaToken("");
    setCaptchaResetKey((current) => current + 1);
  };

  // Sends the password reset request together with the verified
  // CAPTCHA token through the authentication context.
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!captchaToken || submitting) {
      return;
    }

    setError("");
    setSuccess(false);
    setSubmitting(true);

    const authError = await resetPassword(email.trim(), captchaToken);

    setSubmitting(false);

    if (authError) {
      resetCaptcha();
      setError(t("resetEmailFailed"));
      return;
    }

    setSuccess(true);
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <AuthPageControls />

        <div className="auth-brand">
          <img src={rattebIcon} alt="" />
          <h1>{t("appName")}</h1>
        </div>

        <div className="auth-heading">
          <h2>{t("forgotPassword")}</h2>
          <p>{t("forgotPasswordDescription")}</p>
        </div>

        {success ? (
          <div className="reset-email-success">
            <h3>{t("checkYourEmail")}</h3>

            <p>{t("resetEmailSent")}</p>

            <Link to="/login" className="auth-back-link">
              {t("backToLogin")}
            </Link>
          </div>
        ) : (
          <>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="reset-email">{t("email")}</label>

                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  autoComplete="email"
                  required
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                />
              </div>

              <AuthCaptcha
                resetKey={captchaResetKey}
                onVerify={(token) => {
                  setCaptchaToken(token);
                  setError("");
                }}
                onExpire={() => {
                  setCaptchaToken("");
                }}
              />

              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={submitting || !captchaToken}
              >
                {submitting ? t("loading") : t("sendResetLink")}
              </button>
            </form>

            <p className="auth-switch">
              <Link to="/login">{t("backToLogin")}</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default ForgotPasswordPage;
