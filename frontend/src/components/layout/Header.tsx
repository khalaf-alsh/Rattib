import { Bell, BellOff, Moon, Sun, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import Toast from "../ui/Toast";

import {
  disablePushNotifications,
  enablePushNotifications,
  getPushNotificationStatus,
  type PushNotificationStatus,
} from "../../services/pushSubscriptionService";

import rattebIcon from "../../assets/ratteb-icon.png";

import "./Header.css";

type Theme = "dark" | "light";

function Header() {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();
  const location = useLocation();

  // Restore the saved theme, defaulting to dark mode.
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme");

    return savedTheme === "light" ? "light" : "dark";
  });

  const [notificationStatus, setNotificationStatus] =
    useState<PushNotificationStatus>("disabled");

  const [notificationBusy, setNotificationBusy] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Apply theme changes globally and persist the user's preference.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Refresh the browser push status when navigating between app pages.
  // This keeps the header in sync with notification changes made on Account.
  useEffect(() => {
    let mounted = true;

    const loadNotificationStatus = async () => {
      try {
        const status = await getPushNotificationStatus();

        if (mounted) {
          setNotificationStatus(status);
        }
      } catch {
        if (mounted) {
          setNotificationStatus("disabled");
        }
      }
    };

    void loadNotificationStatus();

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  // Automatically dismiss temporary notification status messages.
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

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const toggleLanguage = () => {
    const newLanguage = i18n.language === "ar" ? "en" : "ar";

    void i18n.changeLanguage(newLanguage);
  };

  const handleNotificationClick = async () => {
    if (notificationBusy) {
      return;
    }

    setNotificationBusy(true);

    try {
      if (notificationStatus === "enabled") {
        await disablePushNotifications();

        setNotificationStatus("disabled");
        setToastMessage(t("notificationsDisabledSuccess"));

        return;
      }

      await enablePushNotifications();

      setNotificationStatus("enabled");
      setToastMessage(t("notificationsEnabledSuccess"));
    } catch {
      const currentStatus = await getPushNotificationStatus().catch(
        () => notificationStatus,
      );

      setNotificationStatus(currentStatus);

      if (notificationStatus === "enabled") {
        setToastMessage(t("notificationDisableFailed"));
      } else if (currentStatus === "blocked") {
        setToastMessage(t("notificationPermissionDenied"));
      } else if (currentStatus === "unsupported") {
        setToastMessage(t("notificationUnsupported"));
      } else {
        setToastMessage(t("notificationEnableFailed"));
      }
    } finally {
      setNotificationBusy(false);
    }
  };

  // Save the full current app location so Account can return the user
  // to the same Schedule tab instead of always opening Study Schedule.
  const handleAccountClick = () => {
    if (location.pathname === "/account") {
      return;
    }

    navigate("/account", {
      state: {
        from: `${location.pathname}${location.search}${location.hash}`,
      },
    });
  };

  // Resolve the visible header title from the current route.
  const getPageTitle = () => {
    if (location.pathname === "/account") {
      return t("account");
    }

    if (location.pathname === "/developer") {
      return t("developerPage");
    }

    return t("schedule");
  };

  const notificationsEnabled = notificationStatus === "enabled";

  return (
    <>
      <header className="app-header">
        <button
          type="button"
          className="header-brand"
          onClick={() => navigate("/schedule")}
        >
          <img src={rattebIcon} alt="" className="header-logo" />

          <span>{t("appName")}</span>
        </button>

        <div className="header-divider" />

        <h1 className="header-page-title">{getPageTitle()}</h1>

        <div className="header-actions">
          <button
            type="button"
            className="header-language-button"
            onClick={toggleLanguage}
          >
            {i18n.language === "ar" ? "EN" : "AR"}
          </button>

          {location.pathname === "/schedule" && (
            <button
              type="button"
              className={`header-icon-button header-notification-button${
                notificationsEnabled
                  ? " header-notification-button--enabled"
                  : ""
              }`}
              disabled={notificationBusy}
              onClick={handleNotificationClick}
              aria-label={
                notificationsEnabled
                  ? t("disableNotifications")
                  : t("enableNotifications")
              }
              aria-pressed={notificationsEnabled}
              title={
                notificationsEnabled
                  ? t("disableNotifications")
                  : t("enableNotifications")
              }
            >
              {notificationsEnabled ? (
                <Bell size={20} />
              ) : (
                <BellOff size={20} />
              )}
            </button>
          )}

          <button
            type="button"
            className="header-icon-button"
            onClick={toggleTheme}
            aria-label={t("toggleTheme")}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            type="button"
            className="header-avatar-button"
            onClick={handleAccountClick}
            aria-label={t("account")}
          >
            <UserRound size={22} />
          </button>
        </div>
      </header>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
}

export default Header;
