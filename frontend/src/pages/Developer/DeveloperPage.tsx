import {
  ArrowLeft,
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FaGithub, FaLinkedin } from "react-icons/fa";

import { usePageTitle } from "../../hooks/usePageTitle";

import "./DeveloperPage.css";

const DEVELOPER_EMAIL = "khratteb@gmail.com";
const DEVELOPER_PHONE_DISPLAY = "+966 57 419 0069";
const DEVELOPER_WHATSAPP_URL = "https://wa.me/966574190069";

const LINKEDIN_URL = "https://www.linkedin.com/in/khalaf-alshammari-251b22392/";

const GITHUB_URL = "https://github.com/khalaf-alsh";

function DeveloperPage() {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  usePageTitle("pageTitles.developer");

  return (
    <div className="developer-page">
      <div className="developer-page-heading">
        <button
          type="button"
          className="developer-back-button"
          onClick={() => navigate("/account")}
          aria-label={t("backToAccount")}
        >
          {i18n.dir() === "rtl" ? (
            <ArrowRight size={22} />
          ) : (
            <ArrowLeft size={22} />
          )}
        </button>

        <h2>{t("developerPage")}</h2>
      </div>

      <section className="developer-profile-card">
        <div className="developer-avatar">
          <UserRound size={46} />
        </div>

        <div className="developer-identity">
          <h1>{t("developerName")}</h1>

          <p className="developer-role">{t("developerRole")}</p>

          <div className="developer-location">
            <MapPin size={16} />

            <span>{t("developerLocation")}</span>
          </div>
        </div>
      </section>

      <section className="developer-card">
        <h2>{t("developerAbout")}</h2>

        <p>{t("developerAboutText")}</p>
      </section>

      <section className="developer-card">
        <h2>{t("contactUs")}</h2>

        <div className="developer-links">
          <a className="developer-link" href={`mailto:${DEVELOPER_EMAIL}`}>
            <Mail size={20} />

            <div>
              <span>{t("email")}</span>
              <strong>{DEVELOPER_EMAIL}</strong>
            </div>
          </a>

          <a
            className="developer-link"
            href={DEVELOPER_WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
          >
            <Phone size={20} />

            <div>
              <span>{t("phone")}</span>
              <strong dir="ltr">{DEVELOPER_PHONE_DISPLAY}</strong>
            </div>
          </a>

          <a
            className="developer-link"
            href={LINKEDIN_URL}
            target="_blank"
            rel="noreferrer"
          >
            <FaLinkedin size={20} />

            <div>
              <span>{t("linkedin")}</span>
              <strong>LinkedIn</strong>
            </div>
          </a>

          <a
            className="developer-link"
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
          >
            <FaGithub size={20} />

            <div>
              <span>{t("github")}</span>
              <strong>khalaf-alsh</strong>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}

export default DeveloperPage;
