import { X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import TimeWheelPicker from "../ui/TimeWheelPicker";
import type { Course, Day, Meeting, NewCourse } from "../../types/schedule";
import "./CourseModal.css";

const days: Day[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

type CourseModalMode = "add" | "edit-course" | "edit-meeting";

type CourseModalProps = {
  courses: Course[];

  mode?: CourseModalMode;

  initialCourse?: Course;
  initialMeeting?: Meeting;

  onClose: () => void;
  onSave: (course: NewCourse) => void;
};

type FormErrors = {
  courseName?: string;
  days?: string;
  startTime?: string;
  endTime?: string;
};

type Conflict = {
  day: Day;
  courseName: string;
  startTime: string;
  endTime: string;
};

const convertFrom24Hour = (time: string) => {
  if (!time) {
    return {
      time: "",
      period: "am" as const,
    };
  }

  const [hourText, minuteText] = time.split(":");

  const hour24 = Number(hourText);
  const minute = minuteText;

  const period: "am" | "pm" = hour24 >= 12 ? "pm" : "am";

  let hour12 = hour24 % 12;

  if (hour12 === 0) {
    hour12 = 12;
  }

  return {
    time: `${hour12}:${minute}`,
    period,
  };
};

function CourseModal({
  courses,
  mode = "add",
  initialCourse,
  initialMeeting,
  onClose,
  onSave,
}: CourseModalProps) {
  const { t, i18n } = useTranslation();

  const editingSingleMeeting = mode === "edit-meeting";

  const baseMeeting =
    mode === "edit-meeting" ? initialMeeting : initialCourse?.meetings[0];

  const initialStart = convertFrom24Hour(baseMeeting?.startTime ?? "");

  const initialEnd = convertFrom24Hour(baseMeeting?.endTime ?? "");

  const initialDays: Day[] =
    mode === "edit-meeting" && initialMeeting
      ? [initialMeeting.day]
      : initialCourse
        ? Array.from(
            new Set(initialCourse.meetings.map((meeting) => meeting.day)),
          )
        : [];

  const [courseName, setCourseName] = useState(initialCourse?.name ?? "");

  const [selectedDays, setSelectedDays] = useState<Day[]>(initialDays);

  const [startTime, setStartTime] = useState(initialStart.time);

  const [startPeriod, setStartPeriod] = useState<"am" | "pm">(
    initialStart.period,
  );

  const [endTime, setEndTime] = useState(initialEnd.time);

  const [endPeriod, setEndPeriod] = useState<"am" | "pm">(initialEnd.period);

  const [activeTimePicker, setActiveTimePicker] = useState<"start" | "end" | null>(null);
  const [doctor, setDoctor] = useState(initialCourse?.doctor ?? "");

  const [section, setSection] = useState(initialCourse?.section ?? "");

  const [building, setBuilding] = useState(initialCourse?.building ?? "");

  const [room, setRoom] = useState(initialCourse?.room ?? "");

  const [errors, setErrors] = useState<FormErrors>({});

  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  const conflictRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (conflicts.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      conflictRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [conflicts]);

  const toggleDay = (day: Day) => {
    if (editingSingleMeeting) {
      setSelectedDays([day]);
    } else {
      setSelectedDays((currentDays) =>
        currentDays.includes(day)
          ? currentDays.filter((selectedDay) => selectedDay !== day)
          : [...currentDays, day],
      );
    }

    setErrors((currentErrors) => ({
      ...currentErrors,
      days: undefined,
    }));

    setConflicts([]);
  };

  const isValidTime = (time: string) => {
    const [hourText, minuteText] = time.split(":");

    if (!hourText || !minuteText) {
      return false;
    }

    const hour = Number(hourText);
    const minute = Number(minuteText);

    return (
      Number.isInteger(hour) &&
      Number.isInteger(minute) &&
      hour >= 1 &&
      hour <= 12 &&
      minute >= 0 &&
      minute <= 59
    );
  };

  const convertTo24Hour = (time: string, period: "am" | "pm") => {
    const [hourText, minuteText] = time.split(":");

    let hour = Number(hourText);
    const minute = Number(minuteText);

    if (period === "am" && hour === 12) {
      hour = 0;
    }

    if (period === "pm" && hour !== 12) {
      hour += 12;
    }

    const formattedHour = String(hour).padStart(2, "0");

    const formattedMinute = String(minute).padStart(2, "0");

    return `${formattedHour}:${formattedMinute}`;
  };

  const timeToMinutes = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);

    return hour * 60 + minute;
  };

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

  const isOriginalMeeting = (meeting: Meeting) => {
    if (mode !== "edit-meeting" || !initialMeeting) {
      return false;
    }

    return (
      meeting.day === initialMeeting.day &&
      meeting.startTime === initialMeeting.startTime &&
      meeting.endTime === initialMeeting.endTime
    );
  };

  const findConflicts = (startTime24: string, endTime24: string) => {
    const newStart = timeToMinutes(startTime24);

    const newEnd = timeToMinutes(endTime24);

    const foundConflicts: Conflict[] = [];

    selectedDays.forEach((day) => {
      courses.forEach((course) => {
        course.meetings.forEach((meeting) => {
          if (meeting.day !== day) {
            return;
          }

          if (
            mode === "edit-course" &&
            initialCourse &&
            course.id === initialCourse.id
          ) {
            return;
          }

          if (
            mode === "edit-meeting" &&
            initialCourse &&
            course.id === initialCourse.id &&
            isOriginalMeeting(meeting)
          ) {
            return;
          }

          const existingStart = timeToMinutes(meeting.startTime);

          const existingEnd = timeToMinutes(meeting.endTime);

          const overlaps = newStart < existingEnd && newEnd > existingStart;

          if (overlaps) {
            foundConflicts.push({
              day,
              courseName: course.name,
              startTime: meeting.startTime,
              endTime: meeting.endTime,
            });
          }
        });
      });
    });

    return foundConflicts;
  };

  const saveCourse = (startTime24: string, endTime24: string) => {
    const newCourse: NewCourse = {
      name: courseName.trim(),

      doctor: doctor.trim() || undefined,

      section: section.trim() || undefined,

      building: building.trim() || undefined,

      room: room.trim() || undefined,

      meetings: selectedDays.map((day) => ({
        day,
        startTime: startTime24,
        endTime: endTime24,
      })),
    };

    onSave(newCourse);
    onClose();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const newErrors: FormErrors = {};

    if (!courseName.trim()) {
      newErrors.courseName = t("requiredField");
    }

    if (selectedDays.length === 0) {
      newErrors.days = t("selectAtLeastOneDay");
    }

    if (!startTime || startTime === ":") {
      newErrors.startTime = t("requiredField");
    } else if (!isValidTime(startTime)) {
      newErrors.startTime = t("invalidTime");
    }

    if (!endTime || endTime === ":") {
      newErrors.endTime = t("requiredField");
    } else if (!isValidTime(endTime)) {
      newErrors.endTime = t("invalidTime");
    }

    let startTime24 = "";
    let endTime24 = "";

    if (!newErrors.startTime && !newErrors.endTime) {
      startTime24 = convertTo24Hour(startTime, startPeriod);

      endTime24 = convertTo24Hour(endTime, endPeriod);

      if (timeToMinutes(endTime24) <= timeToMinutes(startTime24)) {
        newErrors.endTime = t("endTimeAfterStart");
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const foundConflicts = findConflicts(startTime24, endTime24);

    if (foundConflicts.length > 0) {
      setConflicts(foundConflicts);
      return;
    }

    saveCourse(startTime24, endTime24);
  };

  const title =
    mode === "add"
      ? t("addCourseTitle")
      : mode === "edit-meeting"
        ? t("editMeetingTitle")
        : t("editCourseTitle");

  return (
    <div className="course-modal-overlay" onClick={onClose}>
      <div
        className="course-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="course-modal-header">
          <h2>{title}</h2>

          <button
            className="course-modal-close"
            type="button"
            onClick={onClose}
            aria-label={t("close")}
          >
            <X size={22} />
          </button>
        </div>

        <form className="course-form" onSubmit={handleSubmit}>
          <div className="form-field full-width">
            <label htmlFor="course-name">
              {t("courseName")} <span className="required">*</span>
            </label>

            <input
              id="course-name"
              type="text"
              value={courseName}
              disabled={editingSingleMeeting}
              placeholder={t("courseName")}
              className={errors.courseName ? "input-error" : ""}
              onChange={(event) => {
                setCourseName(event.target.value);

                setErrors((currentErrors) => ({
                  ...currentErrors,
                  courseName: undefined,
                }));
              }}
            />

            {errors.courseName && (
              <span className="form-error">{errors.courseName}</span>
            )}
          </div>

          <div className="form-field full-width">
            <label>
              {t("courseDays")} <span className="required">*</span>
            </label>

            <div className="course-days-selector">
              {days.map((day) => {
                const isSelected = selectedDays.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    className={`course-day-option ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => toggleDay(day)}
                    aria-pressed={isSelected}
                  >
                    {t(`days.${day}`)}
                  </button>
                );
              })}
            </div>

            {errors.days && <span className="form-error">{errors.days}</span>}
          </div>

          <div className="form-field">
            <label>
              {t("startTime")} <span className="required">*</span>
            </label>

            <button type="button" className="course-time-button" aria-label={t("startTime")} aria-invalid={!!errors.startTime} onClick={() => setActiveTimePicker("start")}>
              {startTime ? formatTime(convertTo24Hour(startTime, startPeriod)) : t("dailyTask.selectTime")}
            </button>

            {errors.startTime && (
              <span className="form-error">{errors.startTime}</span>
            )}
          </div>

          <div className="form-field">
            <label>
              {t("endTime")} <span className="required">*</span>
            </label>

            <button type="button" className="course-time-button" aria-label={t("endTime")} aria-invalid={!!errors.endTime} onClick={() => setActiveTimePicker("end")}>
              {endTime ? formatTime(convertTo24Hour(endTime, endPeriod)) : t("dailyTask.selectTime")}
            </button>

            {errors.endTime && (
              <span className="form-error">{errors.endTime}</span>
            )}
          </div>

          <div className="form-field full-width">
            <label htmlFor="doctor-name">{t("doctorName")}</label>

            <input
              id="doctor-name"
              type="text"
              value={doctor}
              disabled={editingSingleMeeting}
              placeholder={t("optional")}
              onChange={(event) => setDoctor(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="section">{t("section")}</label>

            <input
              id="section"
              type="text"
              value={section}
              disabled={editingSingleMeeting}
              placeholder={t("optional")}
              onChange={(event) => setSection(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="building">{t("building")}</label>

            <input
              id="building"
              type="text"
              value={building}
              disabled={editingSingleMeeting}
              placeholder={t("optional")}
              onChange={(event) => setBuilding(event.target.value)}
            />
          </div>

          <div className="form-field full-width">
            <label htmlFor="room">{t("room")}</label>

            <input
              id="room"
              type="text"
              value={room}
              disabled={editingSingleMeeting}
              placeholder={t("optional")}
              onChange={(event) => setRoom(event.target.value)}
            />
          </div>

          {conflicts.length > 0 && (
            <div ref={conflictRef} className="conflict-warning full-width">
              <strong>{t("scheduleConflict")}</strong>

              <div className="conflict-list">
                {conflicts.map((conflict, index) => (
                  <div
                    key={`${conflict.day}-${conflict.courseName}-${conflict.startTime}-${index}`}
                    className="conflict-item"
                  >
                    <span>{t(`days.${conflict.day}`)}</span>

                    <span>
                      {t("conflictWith")} <strong>{conflict.courseName}</strong>
                    </span>

                    <span>
                      {formatTime(conflict.startTime)} -{" "}
                      {formatTime(conflict.endTime)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="course-modal-actions full-width">
            <button
              className="cancel-course-button"
              type="button"
              onClick={onClose}
            >
              {t("cancel")}
            </button>

            {conflicts.length > 0 ? (
              <button
                className="submit-course-button"
                type="button"
                onClick={() => {
                  const startTime24 = convertTo24Hour(startTime, startPeriod);

                  const endTime24 = convertTo24Hour(endTime, endPeriod);

                  saveCourse(startTime24, endTime24);
                }}
              >
                {t("saveAnyway")}
              </button>
            ) : (
              <button className="submit-course-button" type="submit">
                {mode === "add" ? t("addCourse") : t("saveChanges")}
              </button>
            )}
          </div>
        </form>
        {activeTimePicker && <TimeWheelPicker
          title={t(activeTimePicker === "start" ? "startTime" : "endTime")}
          value={activeTimePicker === "start" ? (startTime ? convertTo24Hour(startTime, startPeriod) : undefined) : (endTime ? convertTo24Hour(endTime, endPeriod) : undefined)}
          onClose={() => setActiveTimePicker(null)}
          onConfirm={(value) => {
            const converted = convertFrom24Hour(value);
            if (activeTimePicker === "start") { setStartTime(converted.time); setStartPeriod(converted.period); }
            else { setEndTime(converted.time); setEndPeriod(converted.period); }
            setErrors((current) => ({ ...current, startTime: undefined, endTime: undefined }));
            setConflicts([]); setActiveTimePicker(null);
          }}
        />}
      </div>
    </div>
  );
}

export default CourseModal;
