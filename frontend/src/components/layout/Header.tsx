import { Moon, Sun, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

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

  // Apply theme changes globally and persist the user's preference.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const toggleLanguage = () => {
    const newLanguage = i18n.language === "ar" ? "en" : "ar";

    void i18n.changeLanguage(newLanguage);
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

  return (
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
  );
}

export default Header;
