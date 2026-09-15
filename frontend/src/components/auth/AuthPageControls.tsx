import { Languages, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import "./AuthPageControls.css";

type Theme = "dark" | "light";

function AuthPageControls() {
  const { t, i18n } = useTranslation();

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

  // Switch between the two supported application languages.
  const toggleLanguage = () => {
    const newLanguage = i18n.language.startsWith("ar") ? "en" : "ar";

    void i18n.changeLanguage(newLanguage);
  };

  return (
    <div className="auth-page-controls">
      <button
        type="button"
        className="auth-control-button"
        onClick={toggleLanguage}
        aria-label={t("authControls.changeLanguage")}
      >
        <Languages size={18} />

        <span>{i18n.language.startsWith("ar") ? "EN" : "AR"}</span>
      </button>

      <button
        type="button"
        className="auth-control-button auth-theme-button"
        onClick={toggleTheme}
        aria-label={t("authControls.changeTheme")}
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
}

export default AuthPageControls;
