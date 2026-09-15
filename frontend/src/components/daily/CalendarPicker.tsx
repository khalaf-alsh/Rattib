import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import "./CalendarPicker.css";

type CalendarPickerProps = {
  selectedDate: Date;
  onSelect: (date: Date) => void;
};

// Compares two calendar dates while ignoring their time values.
function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function CalendarPicker({ selectedDate, onSelect }: CalendarPickerProps) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === "ar";
  const locale = isArabic ? "ar-SA" : "en-US";

  // Keep the original current date stable while the picker is mounted.
  const today = useMemo(() => new Date(), []);

  // Open the calendar on the month that contains
  // the currently selected date.
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  const weekDays = isArabic
    ? ["أح", "إث", "ثل", "أر", "خم", "جم", "سب"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const monthTitle = visibleMonth.toLocaleDateString(locale, {
    calendar: "gregory",
    month: "long",
    year: "numeric",
  });

  // Build a fixed six-week grid starting from the Sunday
  // before the first day of the visible month.
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      1,
    );

    const startDate = new Date(firstDayOfMonth);

    startDate.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(startDate);

      date.setDate(startDate.getDate() + index);

      return date;
    });
  }, [visibleMonth]);

  // Move the visible calendar back by one month.
  const handlePreviousMonth = () => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  };

  // Move the visible calendar forward by one month.
  const handleNextMonth = () => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  };

  // Return the calendar to the current month
  // and immediately select today's date.
  const handleToday = () => {
    const currentToday = new Date();

    setVisibleMonth(
      new Date(currentToday.getFullYear(), currentToday.getMonth(), 1),
    );

    onSelect(currentToday);
  };

  return (
    <div className="calendar-picker">
      <div className="calendar-picker-header">
        <button
          type="button"
          className="calendar-picker-arrow"
          onClick={handlePreviousMonth}
          aria-label={t("planner.previousMonth")}
        >
          {isArabic ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        <strong>{monthTitle}</strong>

        <button
          type="button"
          className="calendar-picker-arrow"
          onClick={handleNextMonth}
          aria-label={t("planner.nextMonth")}
        >
          {isArabic ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <div className="calendar-picker-weekdays">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="calendar-picker-days">
        {calendarDays.map((date) => {
          const outsideMonth = date.getMonth() !== visibleMonth.getMonth();

          const selected = isSameDay(date, selectedDate);

          const currentDay = isSameDay(date, today);

          return (
            <button
              key={date.toISOString()}
              type="button"
              className={[
                "calendar-picker-day",
                outsideMonth ? "outside" : "",
                selected ? "selected" : "",
                currentDay ? "today" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelect(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="calendar-picker-today"
        onClick={handleToday}
      >
        {t("planner.today")}
      </button>
    </div>
  );
}

export default CalendarPicker;
