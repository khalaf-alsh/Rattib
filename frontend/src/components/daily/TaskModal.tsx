import { useState, type FormEvent } from "react";
import { CalendarDays, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import CalendarPicker from "./CalendarPicker";
import type { DailyTask, TaskReminder } from "../../types/dailyPlanner";
import TimeWheelPicker from "../ui/TimeWheelPicker";
import "./TaskModal.css";
import "../schedule/DeleteScopeModal.css";

type TaskModalProps = {
  selectedDate: Date;
  task?: DailyTask;
  onDelete?: () => void;
  onClose: () => void;
  onSave: (task: Omit<DailyTask, "id" | "completed">) => void;
};

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function TaskModal({ selectedDate, task, onDelete, onClose, onSave }: TaskModalProps) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === "ar";
  const locale = isArabic ? "ar-SA" : "en-US";

  const [title, setTitle] = useState(task?.title ?? "");
  const [taskDate, setTaskDate] = useState(() => {
    if (!task) return selectedDate;
    const [year, month, day] = task.date.split("-").map(Number);
    return new Date(year, month - 1, day);
  });

  const [startTime, setStartTime] = useState(task?.startTime ?? "");
  const [endTime, setEndTime] = useState(task?.endTime ?? "");

  const [notes, setNotes] = useState(task?.notes ?? "");

  const [reminder, setReminder] = useState<TaskReminder>(task?.reminder ?? "none");

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [error, setError] = useState("");

  const [activeTimePicker, setActiveTimePicker] = useState<
    "start" | "end" | null
  >(null);

  const formattedDate = taskDate.toLocaleDateString(locale, {
    calendar: "gregory",
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
      setError("dailyTask.errors.titleRequired");
      return;
    }

    if (endTime && !startTime) {
      setError("dailyTask.errors.startTimeRequired");
      return;
    }

    if (startTime && endTime && endTime <= startTime) {
      setError("dailyTask.errors.invalidEndTime");
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
        onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); if (confirmDelete) setConfirmDelete(false); else if (activeTimePicker) setActiveTimePicker(null); else if (calendarOpen) setCalendarOpen(false); else onClose(); } }}
        role="dialog" aria-modal="true" aria-labelledby="task-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="task-modal-header">
          <h2 id="task-modal-title">{t(task ? "dailyTask.editTitle" : "dailyTask.addTitle")}</h2>

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

          {error && <p className="task-modal-error" role="alert">{t(error)}</p>}

          <div className="task-modal-actions">
            {task && onDelete && <button type="button" className="task-delete-button" onClick={() => setConfirmDelete(true)}><Trash2 size={18} />{t("delete")}</button>}
            <button
              type="button"
              className="task-modal-cancel"
              onClick={onClose}
            >
              {t("cancel")}
            </button>

            <button type="submit" className="task-modal-save">
              {t(task ? "saveChanges" : "dailyTask.addTask")}
            </button>
          </div>
        </form>
        {confirmDelete && (
          <div className="delete-scope-overlay" onMouseDown={(event) => event.stopPropagation()} onClick={() => setConfirmDelete(false)}>
            <div className="delete-scope-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-task-title" aria-describedby="delete-task-description" onClick={(event) => event.stopPropagation()}>
              <div className="delete-scope-header"><h3 id="delete-task-title">{t("dailyTask.deleteTitle")}</h3></div>
              <div className="delete-confirmation"><p id="delete-task-description">{t("dailyTask.deleteConfirmation", { title: task?.title })}</p>
                <div className="delete-confirmation-actions">
                  <button type="button" autoFocus className="delete-cancel-button" onClick={() => setConfirmDelete(false)}>{t("cancel")}</button>
                  <button type="button" className="confirm-delete-button" onClick={onDelete}><Trash2 size={17} />{t("delete")}</button>
                </div>
              </div>
            </div>
          </div>
        )}
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
