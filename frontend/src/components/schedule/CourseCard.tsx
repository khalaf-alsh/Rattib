import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./CourseCard.css";

type CourseCardProps = {
  name: string;
  startTime: string;
  endTime: string;
  doctor?: string;
  section?: string;
  building?: string;
  room?: string;

  onEdit?: () => void;
  onDelete?: () => void;
};

function CourseCard({
  name,
  startTime,
  endTime,
  doctor,
  section,
  building,
  room,
  onEdit,
  onDelete,
}: CourseCardProps) {
  const { t, i18n } = useTranslation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Used to detect clicks outside the course options menu.
  const menuRef = useRef<HTMLDivElement>(null);

  // Convert stored 24-hour values into localized 12-hour display text.
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return new Intl.DateTimeFormat(i18n.language === "ar" ? "ar-SA" : "en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  // Close the options menu when the user clicks anywhere outside it.
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <article className="course-card">
      <div className="course-card-header">
        <div>
          <h3 className="course-name">{name}</h3>

          <p className="course-time">
            {formatTime(startTime)} – {formatTime(endTime)}
          </p>
        </div>

        <div className="course-options" ref={menuRef}>
          <button
            className="course-options-button"
            type="button"
            aria-label={t("courseOptions")}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
          >
            <EllipsisVertical size={20} />
          </button>

          {isMenuOpen && (
            <div className="course-options-menu">
              <button
                type="button"
                className="course-menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  onEdit?.();
                }}
              >
                <Pencil size={16} />
                <span>{t("edit")}</span>
              </button>

              <button
                type="button"
                className="course-menu-item delete"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete?.();
                }}
              >
                <Trash2 size={16} />
                <span>{t("delete")}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hide the details section entirely when no optional course data exists. */}
      {(doctor || building || room || section) && (
        <div className="course-details">
          {doctor && (
            <div className="course-detail">
              <span>{t("doctor")}</span>
              <strong>{doctor}</strong>
            </div>
          )}

          {building && (
            <div className="course-detail">
              <span>{t("building")}</span>
              <strong>{building}</strong>
            </div>
          )}

          {room && (
            <div className="course-detail">
              <span>{t("room")}</span>
              <strong>{room}</strong>
            </div>
          )}

          {section && (
            <div className="course-detail">
              <span>{t("section")}</span>
              <strong>{section}</strong>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default CourseCard;
