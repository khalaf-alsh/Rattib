import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import PasswordRequirements from "../../components/auth/PasswordRequirements";
import { useAuth } from "../../context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { isPasswordValid } from "../../lib/passwordPolicy";
import AuthPageControls from "../../components/auth/AuthPageControls";
import rattebIcon from "../../assets/ratteb-icon.png";

import "./ResetPasswordPage.css";

function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { user, loading, updatePassword } = useAuth();

  usePageTitle("pageTitles.resetPassword");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError("");

    // Prevent password reset until every password requirement is met.
    if (!isPasswordValid(password)) {
      setError(t("passwordRules.invalid"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    setSubmitting(true);

    const authError = await updatePassword(password);

    setSubmitting(false);

    if (authError) {
      setError(t("passwordResetFailed"));
      return;
    }

    navigate("/schedule", {
      replace: true,
    });
  };

  if (loading) {
    return (
      <main className="auth-page">
        <div className="auth-card reset-loading">{t("loading")}</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <AuthPageControls />
          <div className="auth-brand">
            <img src={rattebIcon} alt="" />
            <h1>{t("appName")}</h1>
          </div>

          <div className="invalid-reset-link">
            <h2>{t("invalidResetLink")}</h2>

            <p>{t("invalidResetLinkDescription")}</p>

            <Link to="/forgot-password" className="auth-back-link">
              {t("requestNewResetLink")}
            </Link>
          </div>
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
          <h2>{t("setNewPassword")}</h2>

          <p>{t("setNewPasswordDescription")}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="reset-password">{t("newPassword")}</label>

            <input
              id="reset-password"
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
            <label htmlFor="reset-confirm-password">
              {t("confirmPassword")}
            </label>

            <input
              id="reset-confirm-password"
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

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? t("loading") : t("saveNewPassword")}
          </button>
        </form>
      </div>
    </main>
  );
}

export default ResetPasswordPage;
