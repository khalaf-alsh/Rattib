import { CheckCircle2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import "./Toast.css";

type ToastProps = {
  message: string;
  onClose: () => void;
};

function Toast({ message, onClose }: ToastProps) {
  const { t } = useTranslation();

  return (
    // Announce temporary status messages without interrupting the user.
    <div className="toast" role="status" aria-live="polite">
      <CheckCircle2 size={20} className="toast-icon" />

      <span className="toast-message">{message}</span>

      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label={t("close")}
      >
        <X size={17} />
      </button>
    </div>
  );
}

export default Toast;
