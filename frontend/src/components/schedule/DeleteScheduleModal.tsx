import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import "./DeleteScopeModal.css";

type Props = {
  deleting: boolean;
  error: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function DeleteScheduleModal({
  deleting,
  error,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Move focus into the confirmation dialog when it opens,
  // then restore the user's previous focus when it closes.
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => previousFocus?.focus();
  }, []);

  return (
    // Prevent accidental closing while the delete request is in progress.
    <div
      className="delete-scope-overlay"
      onClick={() => {
        if (!deleting) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="delete-scope-modal delete-schedule-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-schedule-title"
        aria-describedby="delete-schedule-description"
        aria-busy={deleting}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          // Allow Escape to close the dialog only when no deletion is running.
          if (event.key === "Escape") {
            event.stopPropagation();
            if (!deleting) onClose();
          }

          // Keep keyboard focus inside the modal while it is open.
          if (event.key === "Tab") {
            const buttons = Array.from(
              event.currentTarget.querySelectorAll<HTMLButtonElement>(
                "button:not(:disabled)",
              ),
            );
            const first = buttons[0];
            const last = buttons[buttons.length - 1];
            if (!first) {
              event.preventDefault();
            } else if (
              event.shiftKey &&
              (document.activeElement === first ||
                document.activeElement === event.currentTarget)
            ) {
              event.preventDefault();
              last.focus();
            } else if (
              !event.shiftKey &&
              (document.activeElement === last ||
                document.activeElement === event.currentTarget)
            ) {
              event.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <div className="delete-scope-header">
          <h3 id="delete-schedule-title">{t("deleteSchedule.title")}</h3>
        </div>
        <div className="delete-confirmation">
          <p id="delete-schedule-description">{t("deleteSchedule.message")}</p>

          {/* Announce deletion failures immediately to assistive technologies. */}
          {error && (
            <p className="delete-schedule-error" role="alert">
              {t("deleteSchedule.error")}
            </p>
          )}

          <div className="delete-confirmation-actions">
            <button
              type="button"
              className="delete-cancel-button"
              disabled={deleting}
              onClick={onClose}
            >
              {t("cancel")}
            </button>

            <button
              type="button"
              className="confirm-delete-button"
              disabled={deleting}
              onClick={onConfirm}
            >
              <Trash2 size={18} />

              {/* Announce the button state change while deletion is running. */}
              <span aria-live="polite">
                {t(
                  deleting
                    ? "deleteSchedule.deleting"
                    : "deleteSchedule.confirm",
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
