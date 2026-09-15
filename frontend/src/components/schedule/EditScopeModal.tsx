import { CalendarDays, Layers3, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Course, Meeting } from "../../types/schedule";
import "./EditScopeModal.css";

type EditScopeModalProps = {
  course: Course;
  meeting: Meeting;
  onEditMeeting: () => void;
  onEditCourse: () => void;
  onClose: () => void;
};

function EditScopeModal({
  course,
  meeting,
  onEditMeeting,
  onEditCourse,
  onClose,
}: EditScopeModalProps) {
  const { t } = useTranslation();

  return (
    // Clicking the overlay closes the modal.
    <div className="edit-scope-overlay" onClick={onClose}>
      <div
        className="edit-scope-modal"
        role="dialog"
        aria-modal="true"
        // Prevent clicks inside the modal from reaching the overlay.
        onClick={(event) => event.stopPropagation()}
      >
        <div className="edit-scope-header">
          <div>
            <h3>{t("chooseEditType")}</h3>
            <p>{course.name}</p>
          </div>

          <button
            type="button"
            className="edit-scope-close"
            onClick={onClose}
            aria-label={t("close")}
          >
            <X size={20} />
          </button>
        </div>

        <div className="edit-scope-options">
          {/* Edit only the selected occurrence of this course. */}
          <button
            type="button"
            className="edit-scope-option"
            onClick={onEditMeeting}
          >
            <CalendarDays size={21} />

            <div>
              <strong>{t("editThisMeeting")}</strong>
              <span>{t(`days.${meeting.day}`)}</span>
            </div>
          </button>

          {/* Edit the shared course data and all of its meetings. */}
          <button
            type="button"
            className="edit-scope-option"
            onClick={onEditCourse}
          >
            <Layers3 size={21} />

            <div>
              <strong>{t("editAllMeetings")}</strong>
              <span>{t("editAllMeetingsDescription")}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditScopeModal;
