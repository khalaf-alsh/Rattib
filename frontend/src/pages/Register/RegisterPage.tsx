import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AuthFooter from "../../components/auth/AuthFooter";
import PasswordRequirements from "../../components/auth/PasswordRequirements";
import AuthPageControls from "../../components/auth/AuthPageControls";
import { useAuth } from "../../context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { isPasswordValid } from "../../lib/passwordPolicy";

import rattebIcon from "../../assets/ratteb-icon.png";

import "./RegisterPage.css";

function RegisterPage() {
  const { t } = useTranslation();

  const { user, signUp } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [acceptedTerms, setAcceptedTerms] = useState(false);

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

    // Account creation is blocked until the user explicitly confirms
    // the age requirement and accepts the legal documents.
    if (!acceptedTerms) {
      setError("termsAcceptance.required");
      return;
    }

    if (!isPasswordValid(password)) {
      setError("passwordRules.invalid");
      return;
    }

    if (password !== confirmPassword) {
      setError("passwordsDoNotMatch");
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
          <AuthPageControls />
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

          <AuthFooter />
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <AuthPageControls />
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
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
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
              aria-describedby="password-requirements"
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
            />

            <PasswordRequirements password={password} />
          </div>

          <div className="auth-field">
            <label htmlFor="confirm-password">{t("confirmPassword")}</label>

            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              autoComplete="new-password"
              required
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setError("");
              }}
            />
          </div>

          <div className="terms-acceptance">
            <label>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => {
                  setAcceptedTerms(event.target.checked);
                  setError("");
                }}
              />

              <span>
                {t("termsAcceptance.age")} {t("termsAcceptance.agree")}{" "}
                <Link to="/terms" target="_blank" rel="noreferrer">
                  {t("legalLinks.terms")}
                </Link>{" "}
                {t("termsAcceptance.andRead")}{" "}
                <Link to="/privacy" target="_blank" rel="noreferrer">
                  {t("legalLinks.privacy")}
                </Link>
              </span>
            </label>
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {t(error)}
            </p>
          )}

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? t("loading") : t("createAccount")}
          </button>
        </form>

        <p className="auth-switch">
          {t("alreadyHaveAccount")} <Link to="/login">{t("login")}</Link>
        </p>

        <AuthFooter />
      </div>
    </main>
  );
}

export default RegisterPage;
