import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import rattebIcon from "../../assets/ratteb-icon.png";
import "./RegisterPage.css";

function RegisterPage() {
  const { t } = useTranslation();
  const { user, signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  usePageTitle("pageTitles.register");

  if (user && !registeredEmail) {
    return <Navigate to="/schedule" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("passwordsDoNotMatch");
      return;
    }

    if (password.length < 6) {
      setError("passwordTooShort");
      return;
    }

    setSubmitting(true);

    const trimmedEmail = email.trim();
    const authError = await signUp(trimmedEmail, password);

    setSubmitting(false);

    if (authError) {
      setError(authError);
      return;
    }

    setRegisteredEmail(trimmedEmail);
  };

  if (registeredEmail) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <img src={rattebIcon} alt="" />
            <h1>{t("appName")}</h1>
          </div>

          <div className="auth-heading">
            <h2>{t("registerVerification.title")}</h2>

            <p>
              {t("registerVerification.message", {
                email: registeredEmail,
              })}
            </p>
          </div>

          <button
            type="button"
            className="auth-submit"
            onClick={() => navigate("/login")}
          >
            {t("registerVerification.login")}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <img src={rattebIcon} alt="" />
          <h1>{t("appName")}</h1>
        </div>

        <div className="auth-heading">
          <h2>{t("createAccount")}</h2>
          <p>{t("registerDescription")}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="register-email">{t("email")}</label>

            <input
              id="register-email"
              type="email"
              value={email}
              autoComplete="email"
              required
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-password">{t("password")}</label>

            <input
              id="register-password"
              type="password"
              value={password}
              autoComplete="new-password"
              required
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirm-password">{t("confirmPassword")}</label>

            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              autoComplete="new-password"
              required
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          {error && <p className="auth-error" role="alert">{t(error)}</p>}

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? t("loading") : t("createAccount")}
          </button>
        </form>

        <p className="auth-switch">
          {t("alreadyHaveAccount")} <Link to="/login">{t("login")}</Link>
        </p>
      </div>
    </main>
  );
}

export default RegisterPage;
