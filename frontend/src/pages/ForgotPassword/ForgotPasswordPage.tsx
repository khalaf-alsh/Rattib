import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import rattebIcon from "../../assets/ratteb-icon.png";
import "./ForgotPasswordPage.css";
import { usePageTitle } from "../../hooks/usePageTitle";
import AuthPageControls from "../../components/auth/AuthPageControls";
function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  usePageTitle("pageTitles.forgotPassword");
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError("");
    setSuccess(false);
    setSubmitting(true);

    const authError = await resetPassword(email.trim());

    setSubmitting(false);

    if (authError) {
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

              {error && <p className="auth-error">{error}</p>}

              <button
                type="submit"
                className="auth-submit"
                disabled={submitting}
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
