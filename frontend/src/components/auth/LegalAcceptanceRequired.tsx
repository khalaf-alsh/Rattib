import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../context/AuthContext";
import { acceptLegalDocuments } from "../../services/legalAcceptanceService";

import rattebIcon from "../../assets/ratteb-icon.png";

import "./LegalAcceptanceRequired.css";

type Props = {
  onAccepted: () => void;
};

function LegalAcceptanceRequired({ onAccepted }: Props) {
  const { t } = useTranslation();

  const { signOut } = useAuth();

  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAccept = async () => {
    if (!accepted || submitting) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await acceptLegalDocuments();

      onAccepted();
    } catch {
      setError(t("legalAcceptance.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="legal-acceptance-page">
      <div className="legal-acceptance-card">
        <div className="auth-brand">
          <img src={rattebIcon} alt="" />
          <h1>{t("appName")}</h1>
        </div>

        <div className="legal-acceptance-heading">
          <h2>{t("legalAcceptance.title")}</h2>

          <p>{t("legalAcceptance.description")}</p>
        </div>

        <label className="legal-acceptance-check">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => {
              setAccepted(event.target.checked);
              setError("");
            }}
          />

          <span>
            {t("termsAcceptance.age")} {t("termsAcceptance.agree")}{" "}
            <Link to="/terms" target="_blank" rel="noreferrer">
              {t("legalLinks.terms")}
            </Link>{" "}
            {t("termsAcceptance.andRead")}{" "}
            <Link to="/privacy" target="_blank" rel="noreferrer">
              {t("legalLinks.privacy")}
            </Link>
          </span>
        </label>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          className="auth-submit"
          disabled={!accepted || submitting}
          onClick={handleAccept}
        >
          {submitting ? t("loading") : t("legalAcceptance.continue")}
        </button>

        <button
          type="button"
          className="legal-acceptance-logout"
          onClick={() => void signOut()}
        >
          {t("logout")}
        </button>
      </div>
    </main>
  );
}

export default LegalAcceptanceRequired;
