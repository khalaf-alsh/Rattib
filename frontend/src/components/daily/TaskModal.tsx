import { useState, type FormEvent } from "react";
import { CalendarDays, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import CalendarPicker from "./CalendarPicker";
import type { DailyTask, TaskReminder } from "../../types/dailyPlanner";
import TimeWheelPicker from "../ui/TimeWheelPicker";
import "./TaskModal.css";

type TaskModalProps = {
  selectedDate: Date;
  onClose: () => void;
  onSave: (task: Omit<DailyTask, "id" | "completed">) => void;
};

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function TaskModal({ selectedDate, onClose, onSave }: TaskModalProps) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === "ar";
  const locale = isArabic ? "ar-SA" : "en-US";

  const [title, setTitle] = useState("");
  const [taskDate, setTaskDate] = useState(selectedDate);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [notes, setNotes] = useState("");

  const [reminder, setReminder] = useState<TaskReminder>("none");

  const [calendarOpen, setCalendarOpen] = useState(false);

  const [error, setError] = useState("");

  const [activeTimePicker, setActiveTimePicker] = useState<
    "start" | "end" | null
  >(null);

  const formattedDate = taskDate.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formatTimeForDisplay = (time: string) => {
    const [hourValue, minute] = time.split(":").map(Number);

    const period =
      hourValue >= 12 ? (isArabic ? "م" : "PM") : isArabic ? "ص" : "AM";

    const hour = hourValue % 12 || 12;

    return `${hour}:${minute.toString().padStart(2, "0")} ${period}`;
  };
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError(t("dailyTask.errors.titleRequired"));
      return;
    }

    if (endTime && !startTime) {
      setError(t("dailyTask.errors.startTimeRequired"));
      return;
    }

    if (startTime && endTime && endTime <= startTime) {
      setError(t("dailyTask.errors.invalidEndTime"));
      return;
    }

    onSave({
      title: title.trim(),
      date: formatDateKey(taskDate),
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      notes: notes.trim() || undefined,
      reminder,
    });
  };

  return (
    <div className="task-modal-overlay" onMouseDown={onClose}>
      <div
        className="task-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="task-modal-header">
          <h2>{t("dailyTask.addTitle")}</h2>

          <button
            type="button"
            className="task-modal-close"
            onClick={onClose}
            aria-label={t("close")}
          >
            <X size={22} />
          </button>
        </div>

        <form className="task-modal-form" onSubmit={handleSubmit}>
          <div className="task-form-field">
            <label htmlFor="task-title">
              {t("dailyTask.taskName")}
              <span>*</span>
            </label>

            <input
              id="task-title"
              type="text"
              value={title}
              autoFocus
              placeholder={t("dailyTask.taskNamePlaceholder")}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="task-form-field">
            <label>
              {t("dailyTask.date")}
              <span>*</span>
            </label>

            <div className="task-date-wrapper">
              <button
                type="button"
                className="task-date-button"
                onClick={() => setCalendarOpen((current) => !current)}
              >
                <CalendarDays size={18} />
                <span>{formattedDate}</span>
              </button>

              {calendarOpen && (
                <CalendarPicker
                  selectedDate={taskDate}
                  onSelect={(date) => {
                    setTaskDate(date);
                    setCalendarOpen(false);
                  }}
                />
              )}
            </div>
          </div>

          <div className="task-time-row">
            <div className="task-form-field">
              <label>{t("dailyTask.startTime")}</label>

              <button
                type="button"
                className={`task-time-button ${startTime ? "has-value" : ""}`}
                onClick={() => setActiveTimePicker("start")}
              >
                {startTime
                  ? formatTimeForDisplay(startTime)
                  : t("dailyTask.selectTime")}
              </button>
            </div>

            <div className="task-form-field">
              <label>{t("dailyTask.endTime")}</label>

              <button
                type="button"
                className={`task-time-button ${endTime ? "has-value" : ""}`}
                disabled={!startTime}
                onClick={() => setActiveTimePicker("end")}
              >
                {endTime
                  ? formatTimeForDisplay(endTime)
                  : t("dailyTask.selectTime")}
              </button>
            </div>
          </div>

          <div className="task-form-field">
            <label htmlFor="task-reminder">{t("dailyTask.reminder")}</label>

            <select
              id="task-reminder"
              value={reminder}
              onChange={(event) =>
                setReminder(event.target.value as TaskReminder)
              }
            >
              <option value="none">{t("dailyTask.reminders.none")}</option>

              <option value="atTime">{t("dailyTask.reminders.atTime")}</option>

              <option value="10Minutes">
                {t("dailyTask.reminders.tenMinutes")}
              </option>

              <option value="15Minutes">
                {t("dailyTask.reminders.fifteenMinutes")}
              </option>

              <option value="30Minutes">
                {t("dailyTask.reminders.thirtyMinutes")}
              </option>

              <option value="1Hour">{t("dailyTask.reminders.oneHour")}</option>
            </select>
          </div>

          <div className="task-form-field">
            <label htmlFor="task-notes">{t("dailyTask.notes")}</label>

            <textarea
              id="task-notes"
              value={notes}
              rows={3}
              placeholder={t("dailyTask.notesPlaceholder")}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          {error && <p className="task-modal-error">{error}</p>}

          <div className="task-modal-actions">
            <button
              type="button"
              className="task-modal-cancel"
              onClick={onClose}
            >
              {t("cancel")}
            </button>

            <button type="submit" className="task-modal-save">
              {t("dailyTask.addTask")}
            </button>
          </div>
        </form>
        {activeTimePicker === "start" && (
          <TimeWheelPicker
            title={t("dailyTask.startTime")}
            value={startTime || undefined}
            onClose={() => setActiveTimePicker(null)}
            onClear={() => {
              setStartTime("");
              setEndTime("");
              setActiveTimePicker(null);
            }}
            onConfirm={(value) => {
              setStartTime(value);
              setActiveTimePicker(null);
            }}
          />
        )}

        {activeTimePicker === "end" && (
          <TimeWheelPicker
            title={t("dailyTask.endTime")}
            value={endTime || undefined}
            onClose={() => setActiveTimePicker(null)}
            onClear={() => {
              setEndTime("");
              setActiveTimePicker(null);
            }}
            onConfirm={(value) => {
              setEndTime(value);
              setActiveTimePicker(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default TaskModal;
