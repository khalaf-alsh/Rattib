import { ArrowLeft, ArrowRight, Languages, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import rattebIcon from "../../assets/ratteb-icon.png";

import { privacyContent, termsContent } from "./legalContent";

import "./LegalPage.css";

type LegalPageProps = {
  type: "privacy" | "terms";
};

function LegalPage({ type }: LegalPageProps) {
  const { i18n } = useTranslation();

  const language = i18n.language.toLowerCase().startsWith("ar") ? "ar" : "en";

  const content =
    type === "privacy" ? privacyContent[language] : termsContent[language];

  const isRtl = language === "ar";

  useEffect(() => {
    document.title = content.browserTitle;
  }, [content.browserTitle]);

  const changeLanguage = (newLanguage: "ar" | "en") => {
    void i18n.changeLanguage(newLanguage);
  };

  return (
    <main className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <Link
            to="/"
            className="legal-back-link"
            aria-label={isRtl ? "العودة إلى رتّب" : "Back to Ratteb"}
          >
            {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}

            <span>{isRtl ? "العودة إلى رتّب" : "Back to Ratteb"}</span>
          </Link>

          <div className="legal-header-actions">
            <div className="legal-language-switcher" aria-label="Language">
              <Languages size={17} aria-hidden="true" />

              <button
                type="button"
                className={language === "ar" ? "active" : ""}
                aria-pressed={language === "ar"}
                onClick={() => changeLanguage("ar")}
              >
                العربية
              </button>

              <span aria-hidden="true">|</span>

              <button
                type="button"
                className={language === "en" ? "active" : ""}
                aria-pressed={language === "en"}
                onClick={() => changeLanguage("en")}
              >
                English
              </button>
            </div>

            <div className="legal-brand">
              <img src={rattebIcon} alt="" />

              <span>{isRtl ? "رتّب" : "Ratteb"}</span>
            </div>
          </div>
        </header>

        <article className="legal-card">
          <div className="legal-title-area">
            <div className="legal-title-icon">
              <ShieldCheck size={26} />
            </div>

            <div>
              <h1>{content.title}</h1>

              <p className="legal-updated">{content.lastUpdated}</p>
            </div>
          </div>

          <p className="legal-intro">{content.intro}</p>

          <div className="legal-sections">
            {content.sections.map((section) => (
              <section key={section.title} className="legal-section">
                <h2>{section.title}</h2>

                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>
        </article>

        <footer className="legal-footer">
          <Link to="/privacy">
            {isRtl ? "سياسة الخصوصية" : "Privacy Policy"}
          </Link>

          <span aria-hidden="true">•</span>

          <Link to="/terms">{isRtl ? "شروط الاستخدام" : "Terms of Use"}</Link>
        </footer>
      </div>
    </main>
  );
}

export default LegalPage;
