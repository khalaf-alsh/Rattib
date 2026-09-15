import { Mail, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import "./AuthFooter.css";

const CONTACT_EMAIL = "khratteb@gmail.com";
const CONTACT_PHONE_DISPLAY = "+966 57 419 0069";
const CONTACT_WHATSAPP_URL = "https://wa.me/966574190069";

function AuthFooter() {
  const { t } = useTranslation();

  return (
    <footer className="auth-footer">
      <div className="auth-footer-legal">
        <Link to="/privacy">{t("legalLinks.privacy")}</Link>

        <span aria-hidden="true">•</span>

        <Link to="/terms">{t("legalLinks.terms")}</Link>
      </div>

      <div className="auth-footer-contact">
        <a href={`mailto:${CONTACT_EMAIL}`}>
          <Mail size={15} />

          <span>{CONTACT_EMAIL}</span>
        </a>

        <a href={CONTACT_WHATSAPP_URL} target="_blank" rel="noreferrer">
          <Phone size={15} />

          <span dir="ltr">{CONTACT_PHONE_DISPLAY}</span>
        </a>
      </div>
    </footer>
  );
}

export default AuthFooter;
