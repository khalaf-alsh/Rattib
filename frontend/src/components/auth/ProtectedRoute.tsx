import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LegalAcceptanceRequired from "./LegalAcceptanceRequired";

import { useAuth } from "../../context/AuthContext";
import { getLegalAcceptanceStatus } from "../../services/legalAcceptanceService";

import rattebIcon from "../../assets/ratteb-icon.png";

import "./ProtectedRoute.css";

function ProtectedRoute() {
  const { t } = useTranslation();

  const { user, loading } = useAuth();

  const [legalLoading, setLegalLoading] = useState(true);
  const [legalAccepted, setLegalAccepted] = useState(false);

  useEffect(() => {
    if (!user) {
      setLegalLoading(false);
      setLegalAccepted(false);
      return;
    }

    let mounted = true;

    // Require acceptance of the currently active legal versions
    // before allowing access to protected Ratteb pages.
    const checkLegalAcceptance = async () => {
      setLegalLoading(true);

      try {
        const accepted = await getLegalAcceptanceStatus();

        if (mounted) {
          setLegalAccepted(accepted);
        }
      } catch {
        if (mounted) {
          setLegalAccepted(false);
        }
      } finally {
        if (mounted) {
          setLegalLoading(false);
        }
      }
    };

    void checkLegalAcceptance();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Show a centered branded loading screen while authentication
  // or legal acceptance status is still being resolved.
  if (loading || legalLoading) {
    return (
      <div
        className="app-loading-screen"
        role="status"
        aria-live="polite"
        aria-label={t("scheduleLoading")}
      >
        <div className="app-loading-spinner">
          <img src={rattebIcon} alt="" className="app-loading-logo" />
        </div>

        <p className="app-loading-text">{t("scheduleLoading")}</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!legalAccepted) {
    return (
      <LegalAcceptanceRequired onAccepted={() => setLegalAccepted(true)} />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
