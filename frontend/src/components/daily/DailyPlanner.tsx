import { useMemo, useState, useEffect } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Check,
  Circle,
  Clock,
  Plus,
  BookOpen,
  Pencil,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import type { DailyTask, DailyTaskInput } from "../../types/dailyPlanner";
import {
  createDailyTask,
  deleteDailyTask,
  getDailyTasks,
  updateDailyTask,
  updateDailyTaskCompletion,
} from "../../services/dailyTaskService";

import type { Course, Day, Meeting } from "../../types/schedule";

import CalendarPicker from "./CalendarPicker";
import TaskModal from "./TaskModal";

import "./DailyPlanner.css";

// Returns the Sunday that starts the week containing the given date.
function getStartOfWeek(date: Date) {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - result.getDay());

  return result;
}

// Creates a new date by moving the supplied date forward
// or backward by the requested number of days.
function addDays(date: Date, days: number) {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
}

// Compares calendar dates while ignoring their time values.
function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

// Converts a local Date into the YYYY-MM-DD format
// used by daily tasks throughout the application.
function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Timed tasks and course meetings share one timeline and are
// distinguished by the "kind" field when rendered.
type TimelineEntry =
  | { kind: "task"; startTime: string; task: DailyTask }
  | { kind: "course"; startTime: string; course: Course; meeting: Meeting };

// JavaScript's getDay() uses Sunday as index 0, so this array
// maps each numeric day index to Rattib's schedule day values.
const days: Day[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function DailyPlanner({ courses }: { courses: Course[] }) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === "ar";
  const locale = isArabic ? "ar-SA" : "en-US";

  // Keep the original "today" value stable while the component is mounted
  // so navigation does not change the reference day unexpectedly.
  const today = useMemo(() => new Date(), []);

  const [selectedDate, setSelectedDate] = useState(today);
  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(today));

  const [calendarOpen, setCalendarOpen] = useState(false);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);

  // Creates a new task or updates an existing occurrence/series,
  // then reloads tasks so recurring changes are reflected correctly.
  const handleSaveTask = async (
    taskInput: DailyTaskInput,
    scope: "single" | "series",
  ) => {
    try {
      let savedTask: DailyTask;

      if (editingTask) {
        savedTask = await updateDailyTask(editingTask.id, taskInput, scope);

        // Reload because editing an entire series may update
        // multiple task occurrences at once.
        const refreshedTasks = await getDailyTasks();

        setTasks(refreshedTasks);
      } else {
        savedTask = await createDailyTask(taskInput);

        // Reload after creation because a recurring task may create
        // multiple database rows in a single request.
        const refreshedTasks = await getDailyTasks();

        setTasks(refreshedTasks);
      }

      setTaskModalOpen(false);
      setEditingTask(null);

      // Move the planner to the saved task's date so the result
      // is immediately visible after creating or editing it.
      const [year, month, day] = savedTask.date.split("-").map(Number);

      const taskDate = new Date(year, month - 1, day);

      setSelectedDate(taskDate);
      setWeekStart(getStartOfWeek(taskDate));
    } catch (error) {
      console.error("Failed to save daily task:", error);
    }
  };

  // Generate the seven visible dates for the currently displayed week.
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const monthTitle = selectedDate.toLocaleDateString(locale, {
    calendar: "gregory",
    month: "long",
    year: "numeric",
  });

  const selectedDateTitle = selectedDate.toLocaleDateString(locale, {
    calendar: "gregory",
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Week navigation keeps the selected date on the equivalent
  // weekday while moving backward or forward by seven days.
  const handlePreviousWeek = () => {
    setWeekStart((current) => addDays(current, -7));
    setSelectedDate((current) => addDays(current, -7));
  };

  const handleNextWeek = () => {
    setWeekStart((current) => addDays(current, 7));
    setSelectedDate((current) => addDays(current, 7));
  };

  // Selecting a calendar date also moves the week strip
  // to the week containing that date.
  const handleCalendarDateSelect = (date: Date) => {
    setSelectedDate(date);
    setWeekStart(getStartOfWeek(date));
    setCalendarOpen(false);
  };

  const [tasks, setTasks] = useState<DailyTask[]>([]);

  // Load the authenticated user's saved daily tasks when
  // the planner is mounted.
  useEffect(() => {
    let active = true;

    getDailyTasks()
      .then((savedTasks) => {
        if (active) {
          setTasks(savedTasks);
        }
      })
      .catch((error) => {
        console.error("Failed to load daily tasks:", error);
      });

    // Prevent an outdated asynchronous request from updating state
    // after the component has already been unmounted.
    return () => {
      active = false;
    };
  }, []);

  // Toggles completion for one task occurrence and replaces
  // only that task in local state with the backend response.
  const toggleTask = async (taskId: number) => {
    const task = tasks.find((currentTask) => currentTask.id === taskId);

    if (!task) {
      return;
    }

    try {
      const updatedTask = await updateDailyTaskCompletion(
        taskId,
        !task.completed,
      );

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === taskId ? updatedTask : currentTask,
        ),
      );
    } catch (error) {
      console.error("Failed to update task completion:", error);
    }
  };

  const selectedDateKey = formatDateKey(selectedDate);

  // Limit daily-task rendering to the currently selected date.
  const selectedDateTasks = tasks.filter(
    (task) => task.date === selectedDateKey,
  );

  // Tasks without a start time appear in the general task list
  // instead of the chronological timeline.
  const tasksWithoutTime = selectedDateTasks.filter((task) => !task.startTime);

  // Timed tasks are sorted before being combined with course meetings.
  const timedTasks = selectedDateTasks
    .filter((task) => task.startTime)
    .sort((firstTask, secondTask) =>
      firstTask.startTime!.localeCompare(secondTask.startTime!),
    );

  // Merge timed user tasks with course meetings for the selected day,
  // then sort everything into one chronological daily timeline.
  const timeline: TimelineEntry[] = [
    ...timedTasks.map(
      (task): TimelineEntry => ({
        kind: "task",
        startTime: task.startTime!,
        task,
      }),
    ),

    ...courses.flatMap((course) =>
      course.meetings
        .filter((meeting) => meeting.day === days[selectedDate.getDay()])
        .map(
          (meeting): TimelineEntry => ({
            kind: "course",
            startTime: meeting.startTime,
            course,
            meeting,
          }),
        ),
    ),
  ].sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Opens the task modal in edit mode for the selected task.
  const openTask = (task: DailyTask) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  // Shared completion control used by both untimed tasks
  // and tasks displayed inside the timeline.
  const completionButton = (task: DailyTask) => (
    <button
      type="button"
      className="daily-task-check"
      role="checkbox"
      aria-checked={task.completed}
      aria-label={t(
        task.completed ? "planner.uncomplete" : "planner.complete",
        { title: task.title },
      )}
      onClick={() => toggleTask(task.id)}
    >
      {task.completed ? <Check size={18} /> : <Circle size={18} />}
    </button>
  );

  // Groups the shared completion and edit controls for a task.
  const taskActions = (task: DailyTask) => (
    <div className="daily-task-actions">
      {completionButton(task)}

      <button
        type="button"
        className="daily-task-edit daily-task-action-edit"
        onClick={() => openTask(task)}
        aria-label={t("planner.edit", { title: task.title })}
      >
        <Pencil size={16} aria-hidden="true" />
      </button>
    </div>
  );

  // Converts stored 24-hour time values into the localized
  // 12-hour display used by the planner.
  const formatTime = (time: string) => {
    const [hourValue, minute] = time.split(":").map(Number);

    const period =
      hourValue >= 12 ? (isArabic ? "م" : "PM") : isArabic ? "ص" : "AM";

    const hour = hourValue % 12 || 12;

    return `${hour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <div className="daily-planner">
      <div className="daily-planner-header">
        <h2>{monthTitle}</h2>

        <div className="daily-calendar-wrapper">
          <button
            type="button"
            className="daily-calendar-button"
            onClick={() => setCalendarOpen((current) => !current)}
            aria-label={t("planner.chooseDate")}
          >
            <CalendarDays size={20} />
          </button>

          {calendarOpen && (
            <CalendarPicker
              selectedDate={selectedDate}
              onSelect={handleCalendarDateSelect}
            />
          )}
        </div>
      </div>

      <div className="daily-week-navigation">
        <button
          type="button"
          className="daily-week-arrow"
          onClick={handlePreviousWeek}
          aria-label={t("planner.previousWeek")}
        >
          {isArabic ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        <div className="daily-week-days">
          {weekDays.map((date) => {
            const selected = isSameDay(date, selectedDate);
            const currentDay = isSameDay(date, today);

            return (
              <button
                key={date.toISOString()}
                type="button"
                className={`daily-day ${
                  selected ? "selected" : ""
                } ${currentDay ? "today" : ""}`}
                onClick={() => setSelectedDate(date)}
              >
                <span className="daily-day-name daily-day-name-desktop">
                  {date.toLocaleDateString(locale, {
                    calendar: "gregory",
                    weekday: "short",
                  })}
                </span>

                <span className="daily-day-name daily-day-name-mobile">
                  {date.toLocaleDateString(locale, {
                    calendar: "gregory",
                    weekday: isArabic ? "narrow" : "short",
                  })}
                </span>

                <span className="daily-day-number">{date.getDate()}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="daily-week-arrow"
          onClick={handleNextWeek}
          aria-label={t("planner.nextWeek")}
        >
          {isArabic ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <div className="daily-selected-date">
        <h3>{selectedDateTitle}</h3>

        <button
          type="button"
          className="daily-add-task-button"
          aria-label={t("dailyTask.addTask")}
          onClick={() => {
            setEditingTask(null);
            setTaskModalOpen(true);
          }}
        >
          <Plus size={18} />
          <span>{t("dailyTask.addTask")}</span>
        </button>
      </div>

      <div className="daily-content">
        {selectedDateTasks.length === 0 && timeline.length === 0 && (
          <div className="daily-empty" role="status">
            <CalendarDays size={28} />
            <h3>{t("planner.emptyTitle")}</h3>
            <p>{t("planner.emptyDescription")}</p>
          </div>
        )}

        {tasksWithoutTime.length > 0 && (
          <section className="daily-tasks-section">
            <div className="daily-section-header">
              <h3>{t("planner.tasks")}</h3>

              <span>
                {tasksWithoutTime.filter((task) => !task.completed).length}
              </span>
            </div>

            <div className="daily-task-list">
              {tasksWithoutTime.map((task) => (
                <div
                  key={task.id}
                  className={`daily-task-item ${
                    task.completed ? "completed" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="daily-task-edit"
                    onClick={() => openTask(task)}
                    aria-label={t("planner.edit", { title: task.title })}
                  >
                    <span className="daily-task-title">{task.title}</span>
                  </button>

                  {taskActions(task)}
                </div>
              ))}
            </div>
          </section>
        )}

        {timeline.length > 0 && (
          <section className="daily-timeline-section">
            <div className="daily-section-header">
              <h3>{t("planner.schedule")}</h3>
            </div>

            <div className="daily-timeline">
              {timeline.map((entry) =>
                entry.kind === "task" ? (
                  <div
                    key={`task-${entry.task.id}`}
                    className={`daily-timeline-item ${
                      entry.task.completed ? "completed" : ""
                    }`}
                  >
                    <div className="daily-timeline-time">
                      <Clock size={15} />
                      <span>{formatTime(entry.startTime)}</span>
                    </div>

                    <div className="daily-timeline-card">
                      <button
                        type="button"
                        className="daily-task-edit"
                        onClick={() => openTask(entry.task)}
                        aria-label={t("planner.edit", {
                          title: entry.task.title,
                        })}
                      >
                        <span className="daily-timeline-card-content">
                          <strong>{entry.task.title}</strong>

                          {entry.task.endTime && (
                            <span>
                              {formatTime(entry.startTime)} –{" "}
                              {formatTime(entry.task.endTime)}
                            </span>
                          )}
                        </span>
                      </button>

                      {taskActions(entry.task)}
                    </div>
                  </div>
                ) : (
                  <div
                    key={`course-${entry.course.id}-${entry.meeting.day}-${entry.startTime}`}
                    className="daily-timeline-item"
                  >
                    <div className="daily-timeline-time">
                      <Clock size={15} />
                      <span>{formatTime(entry.startTime)}</span>
                    </div>

                    <div className="daily-timeline-card daily-course-card">
                      <div className="daily-timeline-card-content">
                        <span className="daily-course-label">
                          <BookOpen size={15} />
                          {t("planner.lecture")}
                        </span>

                        <strong>{entry.course.name}</strong>

                        <span>
                          {formatTime(entry.startTime)} –{" "}
                          {formatTime(entry.meeting.endTime)}
                        </span>

                        {entry.course.room && (
                          <span>
                            {t("room")}: {entry.course.room}
                          </span>
                        )}

                        {entry.course.doctor && (
                          <span>
                            {t("doctor")}: {entry.course.doctor}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        )}
      </div>

      {taskModalOpen && (
        <TaskModal
          task={editingTask ?? undefined}
          onDelete={async (scope) => {
            if (!editingTask) {
              return;
            }

            try {
              await deleteDailyTask(editingTask.id, scope);

              // Reload from the backend because deleting a series
              // may remove multiple task occurrences at once.
              const refreshedTasks = await getDailyTasks();

              setTasks(refreshedTasks);

              setTaskModalOpen(false);
              setEditingTask(null);
            } catch (error) {
              console.error("Failed to delete daily task:", error);
            }
          }}
          selectedDate={selectedDate}
          onClose={() => setTaskModalOpen(false)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}

export default DailyPlanner;
