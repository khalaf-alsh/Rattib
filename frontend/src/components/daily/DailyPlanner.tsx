import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Check,
  Circle,
  Clock,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DailyTask } from "../../types/dailyPlanner";
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

function DailyPlanner() {
  const { i18n } = useTranslation();

  const isArabic = i18n.language === "ar";
  const locale = isArabic ? "ar-SA" : "en-US";

  const today = useMemo(() => new Date(), []);
  const todayKey = formatDateKey(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(today));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const handleAddTask = (newTask: Omit<DailyTask, "id" | "completed">) => {
    const task: DailyTask = {
      ...newTask,
      id: Date.now(),
      completed: false,
    };

    setTasks((currentTasks) => [...currentTasks, task]);

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
    month: "long",
    year: "numeric",
  });

  const selectedDateTitle = selectedDate.toLocaleDateString(locale, {
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

  const [tasks, setTasks] = useState<DailyTask[]>([
    {
      id: 1,
      title: isArabic ? "شراء كتاب" : "Buy a book",
      date: todayKey,
      completed: false,
    },
    {
      id: 2,
      title: isArabic ? "إرسال التقرير" : "Submit the report",
      date: todayKey,
      completed: true,
    },
    {
      id: 3,
      title: isArabic ? "مذاكرة الاختبار" : "Study for the exam",
      date: todayKey,
      startTime: "09:00",
      endTime: "11:00",
      completed: false,
    },
    {
      id: 4,
      title: isArabic ? "موعد الطبيب" : "Doctor appointment",
      date: todayKey,
      startTime: "13:30",
      completed: false,
    },
    {
      id: 5,
      title: isArabic ? "النادي" : "Gym",
      date: todayKey,
      startTime: "18:00",
      endTime: "19:30",
      completed: false,
    },
  ]);

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
            aria-label="Choose date"
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
          aria-label="Previous week"
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
                    weekday: "short",
                  })}
                </span>

                <span className="daily-day-name daily-day-name-mobile">
                  {date.toLocaleDateString(locale, {
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
          aria-label="Next week"
        >
          {isArabic ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <div className="daily-selected-date">
        <h3>{selectedDateTitle}</h3>

        <button
          type="button"
          className="daily-add-task-button"
          onClick={() => setTaskModalOpen(true)}
        >
          <Plus size={18} />
          <span>{isArabic ? "إضافة مهمة" : "Add Task"}</span>
        </button>
      </div>

      <div className="daily-content">
        <section className="daily-tasks-section">
          <div className="daily-section-header">
            <h3>{isArabic ? "مهام اليوم" : "Today's Tasks"}</h3>

            <span>
              {tasksWithoutTime.filter((task) => !task.completed).length}
            </span>
          </div>

          <div className="daily-task-list">
            {tasksWithoutTime.map((task) => (
              <button
                key={task.id}
                type="button"
                className={`daily-task-item ${
                  task.completed ? "completed" : ""
                }`}
                onClick={() => toggleTask(task.id)}
              >
                <span className="daily-task-check">
                  {task.completed ? <Check size={16} /> : <Circle size={18} />}
                </span>

                <span className="daily-task-title">{task.title}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="daily-timeline-section">
          <div className="daily-section-header">
            <h3>{isArabic ? "جدول اليوم" : "Today's Schedule"}</h3>
          </div>

          <div className="daily-timeline">
            {timedTasks.map((task) => (
              <div
                key={task.id}
                className={`daily-timeline-item ${
                  task.completed ? "completed" : ""
                }`}
              >
                <div className="daily-timeline-time">
                  <Clock size={15} />

                  <span>{formatTime(task.startTime!)}</span>
                </div>

                <button
                  type="button"
                  className="daily-timeline-card"
                  onClick={() => toggleTask(task.id)}
                >
                  <div className="daily-timeline-card-content">
                    <strong>{task.title}</strong>

                    {task.endTime && (
                      <span>
                        {formatTime(task.startTime!)}
                        {" – "}
                        {formatTime(task.endTime)}
                      </span>
                    )}
                  </div>

                  <span className="daily-task-check">
                    {task.completed ? (
                      <Check size={16} />
                    ) : (
                      <Circle size={18} />
                    )}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
      {taskModalOpen && (
        <TaskModal
          selectedDate={selectedDate}
          onClose={() => setTaskModalOpen(false)}
          onSave={handleAddTask}
        />
      )}
    </div>
  );
}

export default DailyPlanner;
