import { useMemo, useState } from "react";
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
import type { DailyTask } from "../../types/dailyPlanner";
import type { Course, Day, Meeting } from "../../types/schedule";
import CalendarPicker from "./CalendarPicker";
import "./DailyPlanner.css";
import TaskModal from "./TaskModal";

function getStartOfWeek(date: Date) {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - result.getDay());

  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
}

function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

type TimelineEntry =
  | { kind: "task"; startTime: string; task: DailyTask }
  | { kind: "course"; startTime: string; course: Course; meeting: Meeting };
const days: Day[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
function DailyPlanner({ courses }: { courses: Course[] }) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === "ar";
  const locale = isArabic ? "ar-SA" : "en-US";

  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(today));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const handleSaveTask = (newTask: Omit<DailyTask, "id" | "completed">) => {
    const task: DailyTask = {
      ...newTask,
      id: editingTask?.id ?? Math.max(0, ...tasks.map((task) => task.id)) + 1,
      completed: editingTask?.completed ?? false,
    };

    setTasks((currentTasks) => editingTask ? currentTasks.map((current) => current.id === editingTask.id ? task : current) : [...currentTasks, task]);

    setTaskModalOpen(false);

    const [year, month, day] = task.date.split("-").map(Number);

    const taskDate = new Date(year, month - 1, day);

    setSelectedDate(taskDate);
    setWeekStart(getStartOfWeek(taskDate));
  };
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

  const handlePreviousWeek = () => {
    setWeekStart((current) => addDays(current, -7));
    setSelectedDate((current) => addDays(current, -7));
  };

  const handleNextWeek = () => {
    setWeekStart((current) => addDays(current, 7));
    setSelectedDate((current) => addDays(current, 7));
  };

  const handleCalendarDateSelect = (date: Date) => {
    setSelectedDate(date);
    setWeekStart(getStartOfWeek(date));
    setCalendarOpen(false);
  };

  const [tasks, setTasks] = useState<DailyTask[]>([]);

  const toggleTask = (taskId: number) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const selectedDateKey = formatDateKey(selectedDate);

  const selectedDateTasks = tasks.filter(
    (task) => task.date === selectedDateKey,
  );

  const tasksWithoutTime = selectedDateTasks.filter((task) => !task.startTime);

  const timedTasks = selectedDateTasks
    .filter((task) => task.startTime)
    .sort((firstTask, secondTask) =>
      firstTask.startTime!.localeCompare(secondTask.startTime!),
    );

  const timeline: TimelineEntry[] = [
    ...timedTasks.map((task): TimelineEntry => ({ kind: "task", startTime: task.startTime!, task })),
    ...courses.flatMap((course) => course.meetings.filter((meeting) => meeting.day === days[selectedDate.getDay()])
      .map((meeting): TimelineEntry => ({ kind: "course", startTime: meeting.startTime, course, meeting }))),
  ].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const openTask = (task: DailyTask) => { setEditingTask(task); setTaskModalOpen(true); };
  const completionButton = (task: DailyTask) => (
    <button type="button" className="daily-task-check" role="checkbox" aria-checked={task.completed}
      aria-label={t(task.completed ? "planner.uncomplete" : "planner.complete", { title: task.title })}
      onClick={() => toggleTask(task.id)}>
      {task.completed ? <Check size={18} /> : <Circle size={18} />}
    </button>
  );
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
          onClick={() => { setEditingTask(null); setTaskModalOpen(true); }}
        >
          <Plus size={18} />
          <span>{t("dailyTask.addTask")}</span>
        </button>
      </div>

      <div className="daily-content">
        {selectedDateTasks.length === 0 && timeline.length === 0 && <div className="daily-empty" role="status">
          <CalendarDays size={28} /><h3>{t("planner.emptyTitle")}</h3><p>{t("planner.emptyDescription")}</p>
        </div>}
        {tasksWithoutTime.length > 0 && <section className="daily-tasks-section">
          <div className="daily-section-header"><h3>{t("planner.tasks")}</h3><span>{tasksWithoutTime.filter((task) => !task.completed).length}</span></div>
          <div className="daily-task-list">{tasksWithoutTime.map((task) => (
            <div key={task.id} className={`daily-task-item ${task.completed ? "completed" : ""}`}>
              <button type="button" className="daily-task-edit" onClick={() => openTask(task)} aria-label={t("planner.edit", { title: task.title })}>
                <span className="daily-task-title">{task.title}</span>
              </button>
              {taskActions(task)}
            </div>
          ))}</div>
        </section>}
        {timeline.length > 0 && <section className="daily-timeline-section">
          <div className="daily-section-header"><h3>{t("planner.schedule")}</h3></div>
          <div className="daily-timeline">{timeline.map((entry) => entry.kind === "task" ? (
            <div key={`task-${entry.task.id}`} className={`daily-timeline-item ${entry.task.completed ? "completed" : ""}`}>
              <div className="daily-timeline-time"><Clock size={15} /><span>{formatTime(entry.startTime)}</span></div>
              <div className="daily-timeline-card">
                <button type="button" className="daily-task-edit" onClick={() => openTask(entry.task)} aria-label={t("planner.edit", { title: entry.task.title })}>
                  <span className="daily-timeline-card-content"><strong>{entry.task.title}</strong>
                    {entry.task.endTime && <span>{formatTime(entry.startTime)} – {formatTime(entry.task.endTime)}</span>}
                  </span>
                </button>
                {taskActions(entry.task)}
              </div>
            </div>
          ) : (
            <div key={`course-${entry.course.id}-${entry.meeting.day}-${entry.startTime}`} className="daily-timeline-item">
              <div className="daily-timeline-time"><Clock size={15} /><span>{formatTime(entry.startTime)}</span></div>
              <div className="daily-timeline-card daily-course-card"><div className="daily-timeline-card-content">
                <span className="daily-course-label"><BookOpen size={15} />{t("planner.lecture")}</span>
                <strong>{entry.course.name}</strong><span>{formatTime(entry.startTime)} – {formatTime(entry.meeting.endTime)}</span>
                {entry.course.room && <span>{t("room")}: {entry.course.room}</span>}
                {entry.course.doctor && <span>{t("doctor")}: {entry.course.doctor}</span>}
              </div></div>
            </div>
          ))}</div>
        </section>}
      </div>
      {taskModalOpen && (
        <TaskModal
          task={editingTask ?? undefined}
          onDelete={() => { setTasks((current) => current.filter((task) => task.id !== editingTask?.id)); setTaskModalOpen(false); }}
          selectedDate={selectedDate}
          onClose={() => setTaskModalOpen(false)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}

export default DailyPlanner;
