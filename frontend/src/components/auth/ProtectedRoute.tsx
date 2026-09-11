import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import LegalAcceptanceRequired from "./LegalAcceptanceRequired";

import { useAuth } from "../../context/AuthContext";
import { getLegalAcceptanceStatus } from "../../services/legalAcceptanceService";

function ProtectedRoute() {
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

  if (loading || legalLoading) {
    return <div>Loading...</div>;
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
