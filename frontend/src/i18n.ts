import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "./locales/ar.json";
import en from "./locales/en.json";

// Start with the user's saved language, or Arabic for first-time visitors.
const savedLanguage = localStorage.getItem("language") || "ar";

// Configure the translation resources shared throughout the application.
i18n.use(initReactI18next).init({
  resources: {
    ar: {
      translation: ar,
    },
    en: {
      translation: en,
    },
  },
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    // React already escapes rendered text, so i18next does not need
    // to escape interpolation values again.
    escapeValue: false,
  },
});

// Keep the document language and reading direction synchronized
// with the active application language.
const updateDocumentDirection = (language: string) => {
  const isArabic = language === "ar";

  document.documentElement.lang = language;
  document.documentElement.dir = isArabic ? "rtl" : "ltr";
};

updateDocumentDirection(savedLanguage);

// Persist language changes and immediately update the page direction.
i18n.on("languageChanged", (language) => {
  localStorage.setItem("language", language);
  updateDocumentDirection(language);
});

export default i18n;
