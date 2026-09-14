import { useState, type FormEvent } from "react";
import { CalendarDays, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import CalendarPicker from "./CalendarPicker";
import type {
  DailyTask,
  DailyTaskInput,
  TaskReminder,
  TaskSeriesType,
} from "../../types/dailyPlanner";
import MultiDatePicker from "./MultiDatePicker";
import TimeWheelPicker from "../ui/TimeWheelPicker";

import "./TaskModal.css";
import "../schedule/DeleteScopeModal.css";

type TaskModalProps = {
  selectedDate: Date;
  task?: DailyTask;
  onDelete?: (scope: "single" | "series") => Promise<void>;
  onClose: () => void;
  onSave: (task: DailyTaskInput, scope: "single" | "series") => Promise<void>;
};

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
}

const REMINDER_OFFSETS_MINUTES: Partial<Record<TaskReminder, number>> = {
  atTime: 0,
  "10Minutes": 10,
  "15Minutes": 15,
  "30Minutes": 30,
  "1Hour": 60,
};

function createLocalDateTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  const result = new Date(date);

  result.setHours(hours, minutes, 0, 0);

  return result;
}

function calculateReminderDate(
  date: Date,
  startTime: string,
  reminder: TaskReminder,
  reminderTime: string,
): Date | null {
  // Calculate the reminder in the browser's local time before saving.
  if (reminder === "none") {
    return null;
  }

  if (reminder === "customTime") {
    if (!reminderTime) {
      return null;
    }

    return createLocalDateTime(date, reminderTime);
  }

  if (!startTime) {
    return null;
  }

  const taskStart = createLocalDateTime(date, startTime);

  const offset = REMINDER_OFFSETS_MINUTES[reminder];

  if (offset === undefined) {
    return null;
  }

  return new Date(taskStart.getTime() - offset * 60 * 1000);
}

function TaskModal({
  selectedDate,
  task,
  onDelete,
  onClose,
  onSave,
}: TaskModalProps) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === "ar";
  const locale = isArabic ? "ar-SA" : "en-US";
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [title, setTitle] = useState(task?.title ?? "");

  const [taskDate, setTaskDate] = useState(() => {
    if (!task) {
      return selectedDate;
    }

    const [year, month, day] = task.date.split("-").map(Number);

    return new Date(year, month - 1, day);
  });

  const [seriesType, setSeriesType] = useState<TaskSeriesType>("single");

  const [repeatUntil, setRepeatUntil] = useState<Date | null>(null);

  const [repeatCalendarOpen, setRepeatCalendarOpen] = useState(false);

  const [customDates, setCustomDates] = useState<Date[]>([]);

  const [customDatePickerOpen, setCustomDatePickerOpen] = useState(false);

  const [startTime, setStartTime] = useState(task?.startTime ?? "");

  const [endTime, setEndTime] = useState(task?.endTime ?? "");

  const [notes, setNotes] = useState(task?.notes ?? "");

  const [reminder, setReminder] = useState<TaskReminder>(
    task?.reminder ?? "none",
  );

  const [reminderTime, setReminderTime] = useState(task?.reminderTime ?? "");

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmEditScope, setConfirmEditScope] = useState(false);

  const [pendingTaskInput, setPendingTaskInput] =
    useState<DailyTaskInput | null>(null);

  const [calendarOpen, setCalendarOpen] = useState(false);

  const [error, setError] = useState("");

  const [activeTimePicker, setActiveTimePicker] = useState<
    "start" | "end" | "reminder" | null
  >(null);

  const handleDelete = async (scope: "single" | "series") => {
    if (!onDelete || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await onDelete(scope);
    } finally {
      setIsDeleting(false);
    }
  };
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

  const resetReminder = () => {
    setReminder("none");
    setReminderTime("");
  };

  const handleReminderChange = (value: TaskReminder) => {
    setReminder(value);
    setError("");

    if (value !== "customTime") {
      setReminderTime("");
    }
  };

  const maxRepeatDate = addDays(taskDate, 30);

  const formattedRepeatUntil = repeatUntil?.toLocaleDateString(locale, {
    calendar: "gregory",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleSeriesTypeChange = (value: TaskSeriesType) => {
    setSeriesType(value);
    setError("");

    if (value !== "daily" && value !== "weekly") {
      setRepeatUntil(null);
      setRepeatCalendarOpen(false);
    }

    if (value !== "customDates") {
      setCustomDates([]);
      setCustomDatePickerOpen(false);
    }
  };

  const handleSaveWithScope = async (
    taskInput: DailyTaskInput,
    scope: "single" | "series",
  ) => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await onSave(taskInput, scope);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
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

    if (!startTime && reminder === "customTime" && !reminderTime) {
      setError("dailyTask.errors.reminderTimeRequired");
      return;
    }

    if (reminder !== "none") {
      const reminderDate = calculateReminderDate(
        taskDate,
        startTime,
        reminder,
        reminderTime,
      );

      if (reminderDate && reminderDate <= new Date()) {
        setError("dailyTask.errors.reminderMustBeFuture");
        return;
      }
    }

    if (!task && (seriesType === "daily" || seriesType === "weekly")) {
      if (!repeatUntil) {
        setError("dailyTask.errors.repeatUntilRequired");
        return;
      }

      if (repeatUntil < taskDate) {
        setError("dailyTask.errors.repeatUntilBeforeStart");
        return;
      }

      if (repeatUntil > maxRepeatDate) {
        setError("dailyTask.errors.repeatLimitExceeded");
        return;
      }
    }

    if (!task && seriesType === "customDates" && customDates.length === 0) {
      setError("dailyTask.errors.customDatesRequired");
      return;
    }

    const timeZone =
      reminder !== "none"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : undefined;

    const taskInput: DailyTaskInput = {
      title: title.trim(),
      date: formatDateKey(taskDate),

      startTime: startTime || undefined,
      endTime: endTime || undefined,

      notes: notes.trim() || undefined,

      reminder,

      reminderTime:
        reminder === "customTime" ? reminderTime || undefined : undefined,

      timeZone,

      // Recurrence metadata is only used when creating a new series.
      seriesType: task ? "single" : seriesType,

      repeatUntil:
        !task &&
        (seriesType === "daily" || seriesType === "weekly") &&
        repeatUntil
          ? formatDateKey(repeatUntil)
          : undefined,

      customDates:
        !task && seriesType === "customDates"
          ? customDates.map(formatDateKey)
          : undefined,
    };

    if (task?.seriesId) {
      setPendingTaskInput(taskInput);
      setConfirmEditScope(true);
      return;
    }

    await handleSaveWithScope(taskInput, "single");
  };

  return (
    <div className="task-modal-overlay" onMouseDown={onClose}>
      <div
        className="task-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key !== "Escape") {
            return;
          }

          event.stopPropagation();

          if (confirmDelete) {
            setConfirmDelete(false);
          } else if (confirmEditScope) {
            setConfirmEditScope(false);
            setPendingTaskInput(null);
          } else if (activeTimePicker) {
            setActiveTimePicker(null);
          } else if (repeatCalendarOpen) {
            setRepeatCalendarOpen(false);
          } else if (customDatePickerOpen) {
            setCustomDatePickerOpen(false);
          } else if (calendarOpen) {
            setCalendarOpen(false);
          } else {
            onClose();
          }
        }}
      >
        <div className="task-modal-header">
          <h2 id="task-modal-title">
            {t(task ? "dailyTask.editTitle" : "dailyTask.addTitle")}
          </h2>

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

                    if (repeatUntil && repeatUntil < date) {
                      setRepeatUntil(null);
                    }

                    // Extra selected dates depend on the main task date,
                    // so reset them when the starting date changes.
                    setCustomDates([]);
                    setCustomDatePickerOpen(false);
                  }}
                />
              )}
            </div>
          </div>

          {!task && (
            <div className="task-form-field">
              <label htmlFor="task-repeat">{t("dailyTask.repeat")}</label>

              <select
                id="task-repeat"
                value={seriesType}
                onChange={(event) =>
                  handleSeriesTypeChange(event.target.value as TaskSeriesType)
                }
              >
                <option value="single">{t("dailyTask.repeats.none")}</option>

                <option value="daily">{t("dailyTask.repeats.daily")}</option>

                <option value="weekly">{t("dailyTask.repeats.weekly")}</option>

                <option value="customDates">
                  {t("dailyTask.repeats.customDates")}
                </option>
              </select>
            </div>
          )}

          {!task && (seriesType === "daily" || seriesType === "weekly") && (
            <div className="task-form-field">
              <label>
                {t("dailyTask.repeatUntil")}
                <span>*</span>
              </label>

              <div className="task-date-wrapper">
                <button
                  type="button"
                  className="task-date-button"
                  onClick={() => setRepeatCalendarOpen((current) => !current)}
                >
                  <CalendarDays size={18} />

                  <span>
                    {formattedRepeatUntil ?? t("dailyTask.selectRepeatEnd")}
                  </span>
                </button>

                {repeatCalendarOpen && (
                  <CalendarPicker
                    selectedDate={repeatUntil ?? taskDate}
                    onSelect={(date) => {
                      if (date < taskDate) {
                        setError("dailyTask.errors.repeatUntilBeforeStart");
                        return;
                      }

                      if (date > maxRepeatDate) {
                        setError("dailyTask.errors.repeatLimitExceeded");
                        return;
                      }

                      setRepeatUntil(date);
                      setRepeatCalendarOpen(false);
                      setError("");
                    }}
                  />
                )}
              </div>

              <small className="task-repeat-help">
                {t("dailyTask.repeatLimit")}
              </small>
            </div>
          )}

          {!task && seriesType === "customDates" && (
            <div className="task-form-field">
              <label>
                {t("dailyTask.multipleDates")}
                <span>*</span>
              </label>

              <div className="task-date-wrapper">
                <button
                  type="button"
                  className="task-date-button"
                  onClick={() => setCustomDatePickerOpen(true)}
                >
                  <CalendarDays size={18} />

                  <span>
                    {customDates.length > 0
                      ? t("dailyTask.selectedDatesCount", {
                          count: customDates.length,
                        })
                      : t("dailyTask.selectMultipleDates")}
                  </span>
                </button>

                {customDatePickerOpen && (
                  <MultiDatePicker
                    startDate={taskDate}
                    selectedDates={customDates}
                    maxDate={maxRepeatDate}
                    onConfirm={(dates) => {
                      setCustomDates(dates);
                      setCustomDatePickerOpen(false);
                      setError("");
                    }}
                    onCancel={() => {
                      setCustomDatePickerOpen(false);
                    }}
                  />
                )}
              </div>

              <small className="task-repeat-help">
                {t("dailyTask.multipleDatesHelp")}
              </small>
            </div>
          )}

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
                handleReminderChange(event.target.value as TaskReminder)
              }
            >
              <option value="none">{t("dailyTask.reminders.none")}</option>

              {startTime ? (
                <>
                  <option value="atTime">
                    {t("dailyTask.reminders.atTime")}
                  </option>

                  <option value="10Minutes">
                    {t("dailyTask.reminders.tenMinutes")}
                  </option>

                  <option value="15Minutes">
                    {t("dailyTask.reminders.fifteenMinutes")}
                  </option>

                  <option value="30Minutes">
                    {t("dailyTask.reminders.thirtyMinutes")}
                  </option>

                  <option value="1Hour">
                    {t("dailyTask.reminders.oneHour")}
                  </option>
                </>
              ) : (
                <option value="customTime">
                  {t("dailyTask.reminders.customTime")}
                </option>
              )}
            </select>
          </div>

          {!startTime && reminder === "customTime" && (
            <div className="task-form-field">
              <label>{t("dailyTask.reminderTime")}</label>

              <button
                type="button"
                className={`task-time-button ${
                  reminderTime ? "has-value" : ""
                }`}
                onClick={() => setActiveTimePicker("reminder")}
              >
                {reminderTime
                  ? formatTimeForDisplay(reminderTime)
                  : t("dailyTask.selectTime")}
              </button>
            </div>
          )}

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

          {error && (
            <p className="task-modal-error" role="alert">
              {t(error)}
            </p>
          )}

          <div className="task-modal-actions">
            {task && onDelete && (
              <button
                type="button"
                className="task-delete-button"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={18} />
                {t("delete")}
              </button>
            )}

            <button
              type="button"
              className="task-modal-cancel"
              onClick={onClose}
            >
              {t("cancel")}
            </button>

            <button
              type="submit"
              className="task-modal-save"
              disabled={isSaving}
            >
              {isSaving
                ? t("dailyTask.saving")
                : t(task ? "saveChanges" : "dailyTask.addTask")}
            </button>
          </div>
        </form>

        {confirmDelete && (
          <div
            className="delete-scope-overlay"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => {
              if (!isDeleting) {
                setConfirmDelete(false);
              }
            }}
          >
            <div
              className="delete-scope-modal"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-task-title"
              aria-describedby="delete-task-description"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="delete-scope-header">
                <h3 id="delete-task-title">{t("dailyTask.deleteTitle")}</h3>
              </div>

              <div className="delete-confirmation">
                <p id="delete-task-description">
                  {task?.seriesId
                    ? t("dailyTask.deleteSeriesConfirmation", {
                        title: task.title,
                      })
                    : t("dailyTask.deleteConfirmation", {
                        title: task?.title,
                      })}
                </p>

                <div className="delete-confirmation-actions">
                  <button
                    type="button"
                    className="delete-cancel-button"
                    disabled={isDeleting}
                    onClick={() => setConfirmDelete(false)}
                  >
                    {t("cancel")}
                  </button>

                  {task?.seriesId ? (
                    <>
                      <button
                        type="button"
                        className="delete-single-button"
                        disabled={isDeleting}
                        onClick={() => void handleDelete("single")}
                      >
                        <Trash2 size={17} />

                        {t("dailyTask.deleteThisTask")}
                      </button>

                      <button
                        type="button"
                        className="confirm-delete-button"
                        disabled={isDeleting}
                        onClick={() => void handleDelete("series")}
                      >
                        <Trash2 size={17} />

                        {t("dailyTask.deleteEntireSeries")}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="confirm-delete-button"
                      disabled={isDeleting}
                      onClick={() => void handleDelete("single")}
                    >
                      <Trash2 size={17} />

                      {isDeleting ? t("dailyTask.deleting") : t("delete")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {confirmEditScope && pendingTaskInput && (
          <div
            className="delete-scope-overlay"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => {
              if (!isSaving) {
                setConfirmEditScope(false);
                setPendingTaskInput(null);
              }
            }}
          >
            <div
              className="delete-scope-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-scope-title"
              aria-describedby="edit-scope-description"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="delete-scope-header">
                <h3 id="edit-scope-title">{t("dailyTask.editSeriesTitle")}</h3>
              </div>

              <div className="delete-confirmation">
                <p id="edit-scope-description">
                  {t("dailyTask.editSeriesConfirmation")}
                </p>

                <div className="delete-confirmation-actions">
                  <button
                    type="button"
                    className="delete-cancel-button"
                    disabled={isSaving}
                    onClick={() => {
                      setConfirmEditScope(false);
                      setPendingTaskInput(null);
                    }}
                  >
                    {t("cancel")}
                  </button>

                  <button
                    type="button"
                    className="edit-single-button"
                    disabled={isSaving}
                    onClick={() =>
                      void handleSaveWithScope(pendingTaskInput, "single")
                    }
                  >
                    {t("dailyTask.editThisTask")}
                  </button>

                  <button
                    type="button"
                    className="edit-series-button"
                    disabled={isSaving}
                    onClick={() =>
                      void handleSaveWithScope(pendingTaskInput, "series")
                    }
                  >
                    {isSaving
                      ? t("dailyTask.saving")
                      : t("dailyTask.editEntireSeries")}
                  </button>
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

              resetReminder();

              setActiveTimePicker(null);
            }}
            onConfirm={(value) => {
              const wasUntimed = !startTime;

              setStartTime(value);

              if (wasUntimed && reminder === "customTime") {
                resetReminder();
              }

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

        {activeTimePicker === "reminder" && (
          <TimeWheelPicker
            title={t("dailyTask.reminderTime")}
            value={reminderTime || undefined}
            onClose={() => setActiveTimePicker(null)}
            onClear={() => {
              setReminderTime("");
              setReminder("none");
              setActiveTimePicker(null);
            }}
            onConfirm={(value) => {
              setReminderTime(value);
              setActiveTimePicker(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default TaskModal;
