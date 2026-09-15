import { CalendarX, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Course, Meeting } from "../../types/schedule";
import "./DeleteScopeModal.css";

type DeleteScopeModalProps = {
  course: Course;
  meeting: Meeting;
  onDeleteMeeting: () => void;
  onDeleteCourse: () => void;
  onClose: () => void;
};

function DeleteScopeModal({
  course,
  meeting,
  onDeleteMeeting,
  onDeleteCourse,
  onClose,
}: DeleteScopeModalProps) {
  const { t } = useTranslation();

  // A single meeting does not need a separate "delete this meeting" option
  // because removing it would effectively remove the entire course.
  const hasMultipleMeetings = course.meetings.length > 1;

  return (
    // Clicking the overlay closes the modal.
    <div className="delete-scope-overlay" onClick={onClose}>
      <div
        className="delete-scope-modal"
        role="dialog"
        aria-modal="true"
        // Prevent clicks inside the modal from reaching the overlay.
        onClick={(event) => event.stopPropagation()}
      >
        <div className="delete-scope-header">
          <div>
            <h3>{t("deleteCourseTitle")}</h3>
            <p>{course.name}</p>
          </div>

          <button
            type="button"
            className="delete-scope-close"
            onClick={onClose}
            aria-label={t("close")}
          >
            <X size={20} />
          </button>
        </div>

        {hasMultipleMeetings ? (
          <div className="delete-scope-options">
            <p className="delete-warning-text">{t("chooseDeleteType")}</p>

            {/* Delete only the selected meeting while keeping the course. */}
            <button
              type="button"
              className="delete-scope-option"
              onClick={onDeleteMeeting}
            >
              <CalendarX size={21} />

              <div>
                <strong>{t("deleteThisMeeting")}</strong>
                <span>{t(`days.${meeting.day}`)}</span>
              </div>
            </button>

            {/* Delete the course together with all of its meetings. */}
            <button
              type="button"
              className="delete-scope-option danger"
              onClick={onDeleteCourse}
            >
              <Trash2 size={21} />

              <div>
                <strong>{t("deleteAllMeetings")}</strong>
                <span>{t("deleteAllMeetingsDescription")}</span>
              </div>
            </button>

            <button
              type="button"
              className="delete-cancel-button"
              onClick={onClose}
            >
              {t("cancel")}
            </button>
          </div>
        ) : (
          // When the course has only one meeting, deleting that meeting
          // means deleting the whole course.
          <div className="delete-confirmation">
            <p>{t("deleteCourseConfirmation")}</p>

            <div className="delete-confirmation-actions">
              <button
                type="button"
                className="delete-cancel-button"
                onClick={onClose}
              >
                {t("cancel")}
              </button>

              <button
                type="button"
                className="confirm-delete-button"
                onClick={onDeleteCourse}
              >
                <Trash2 size={17} />
                {t("delete")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeleteScopeModal;
