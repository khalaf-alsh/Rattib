import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";

import AuthFooter from "../../components/auth/AuthFooter";
import AuthPageControls from "../../components/auth/AuthPageControls";
import AuthCaptcha from "../../components/auth/AuthCaptcha";

import rattebIcon from "../../assets/ratteb-icon.png";

import "./LoginPage.css";

function LoginPage() {
  const { t } = useTranslation();
  const { user, signIn } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);

  usePageTitle("pageTitles.login");

  if (user) {
    return <Navigate to="/schedule" replace />;
  }

  // Resets the CAPTCHA after a failed authentication attempt
  // because a Turnstile token should not be reused.
  const resetCaptcha = () => {
    setCaptchaToken("");
    setCaptchaResetKey((current) => current + 1);
  };

  // Validates the CAPTCHA token before sending the login request
  // to Supabase through the authentication context.
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!captchaToken || submitting) {
      return;
    }

    setError("");
    setSubmitting(true);

    const authError = await signIn(email.trim(), password, captchaToken);

    setSubmitting(false);

    if (authError) {
      resetCaptcha();
      setError(authError);
      return;
    }

    navigate("/schedule", { replace: true });
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
          <h2>{t("login")}</h2>
          <p>{t("loginDescription")}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="login-email">{t("email")}</label>

            <input
              id="login-email"
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
            <label htmlFor="login-password">{t("password")}</label>

            <div className="password-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete="current-password"
                required
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
              />

              <button
                type="button"
                className="password-toggle-button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={
                  showPassword ? t("hidePassword") : t("showPassword")
                }
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <div className="forgot-password-row">
            <Link to="/forgot-password">{t("forgotPassword")}</Link>
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
              {t(error)}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={submitting || !captchaToken}
          >
            {submitting ? t("loading") : t("login")}
          </button>
        </form>

        <p className="auth-switch">
          {t("noAccount")} <Link to="/register">{t("createAccount")}</Link>
        </p>

        <AuthFooter />
      </div>
    </main>
  );
}

export default LoginPage;
