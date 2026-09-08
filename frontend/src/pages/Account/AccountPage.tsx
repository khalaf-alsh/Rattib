import { ArrowLeft, ArrowRight, LockKeyhole, LogOut, Mail, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/ui/Toast";
import "./AccountPage.css";
import { usePageTitle } from "../../hooks/usePageTitle";

function AccountPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { user, updateEmail, updatePassword, signOut } = useAuth();

  const [email, setEmail] = useState(user?.email ?? "");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  usePageTitle("pageTitles.account");
  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toastMessage]);

  const handleEmailSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setEmailError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError(t("requiredField"));
      return;
    }

    if (trimmedEmail === user?.email) {
      setEmailError(t("emailUnchanged"));
      return;
    }

    setUpdatingEmail(true);

    const error = await updateEmail(trimmedEmail);

    setUpdatingEmail(false);

    if (error) {
      setEmailError(t("emailUpdateFailed"));
      return;
    }

    setToastMessage(t("emailUpdateSuccess"));
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError(t("passwordTooShort"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwordsDoNotMatch"));
      return;
    }

    setUpdatingPassword(true);

    const error = await updatePassword(newPassword);

    setUpdatingPassword(false);

    if (error) {
      setPasswordError(t("passwordUpdateFailed"));
      return;
    }

    setNewPassword("");
    setConfirmPassword("");

    setToastMessage(t("passwordUpdateSuccess"));
  };

  const handleLogout = async () => {
    setLoggingOut(true);

    await signOut();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="account-page">
      <Link className="account-back-link" to="/schedule">{i18n.dir() === "rtl" ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}{t("backToSchedule")}</Link>
      <section className="profile-header">
        <div className="profile-avatar">
          <UserRound size={38} />
        </div>

        <div>
          <h2>{t("profile")}</h2>
          <p>{user?.email}</p>
        </div>
      </section>

      <div className="account-sections">
        <section className="account-card">
          <div className="account-card-heading">
            <div className="account-card-icon">
              <Mail size={20} />
            </div>

            <div>
              <h3>{t("changeEmail")}</h3>
              <p>{t("changeEmailDescription")}</p>
            </div>
          </div>

          <form className="account-form" onSubmit={handleEmailSubmit}>
            <div className="account-field">
              <label htmlFor="account-email">{t("email")}</label>

              <input
                id="account-email"
                type="email"
                value={email}
                autoComplete="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailError("");
                }}
              />

              {emailError && (
                <span className="account-error">{emailError}</span>
              )}
            </div>

            <button
              type="submit"
              className="account-primary-button"
              disabled={updatingEmail}
            >
              {updatingEmail ? t("loading") : t("updateEmail")}
            </button>
          </form>
        </section>

        <section className="account-card">
          <div className="account-card-heading">
            <div className="account-card-icon">
              <LockKeyhole size={20} />
            </div>

            <div>
              <h3>{t("changePassword")}</h3>
              <p>{t("changePasswordDescription")}</p>
            </div>
          </div>

          <form className="account-form" onSubmit={handlePasswordSubmit}>
            <div className="account-field">
              <label htmlFor="new-password">{t("newPassword")}</label>

              <input
                id="new-password"
                type="password"
                value={newPassword}
                autoComplete="new-password"
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setPasswordError("");
                }}
              />
            </div>

            <div className="account-field">
              <label htmlFor="confirm-new-password">
                {t("confirmPassword")}
              </label>

              <input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                autoComplete="new-password"
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setPasswordError("");
                }}
              />

              {passwordError && (
                <span className="account-error">{passwordError}</span>
              )}
            </div>

            <button
              type="submit"
              className="account-primary-button"
              disabled={updatingPassword}
            >
              {updatingPassword ? t("loading") : t("updatePassword")}
            </button>
          </form>
        </section>

        <section className="account-card danger-card">
          <div className="account-card-heading">
            <div className="account-card-icon danger-icon">
              <LogOut size={20} />
            </div>

            <div>
              <h3>{t("logout")}</h3>
              <p>{t("logoutDescription")}</p>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            disabled={loggingOut}
            onClick={handleLogout}
          >
            <LogOut size={18} />

            {loggingOut ? t("loading") : t("logout")}
          </button>
        </section>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}

export default AccountPage;
