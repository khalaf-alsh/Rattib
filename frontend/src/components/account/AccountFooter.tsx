import { Mail, Phone, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import "./AccountFooter.css";

const CONTACT_EMAIL = "khratteb@gmail.com";
const CONTACT_PHONE_DISPLAY = "+966 57 419 0069";
const CONTACT_WHATSAPP_URL = "https://wa.me/966574190069";

function AccountFooter() {
  const { t } = useTranslation();

  return (
    <footer className="account-footer">
      <section
        className="account-footer-section"
        aria-labelledby="account-contact-heading"
      >
        <h2 id="account-contact-heading">{t("contactUs")}</h2>

        <div className="account-footer-links">
          <a className="account-footer-link" href={`mailto:${CONTACT_EMAIL}`}>
            <Mail size={18} />

            <span>{CONTACT_EMAIL}</span>
          </a>

          <a
            className="account-footer-link"
            href={CONTACT_WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
          >
            <Phone size={18} />

            <span dir="ltr">{CONTACT_PHONE_DISPLAY}</span>
          </a>

          <Link className="account-footer-link" to="/developer">
            <UserRound size={18} />

            <span>{t("developerPage")}</span>
          </Link>
        </div>
      </section>
    </footer>
  );
}

export default AccountFooter;
