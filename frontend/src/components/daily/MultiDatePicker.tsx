import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import "./MultiDatePicker.css";

type MultiDatePickerProps = {
  startDate: Date;
  selectedDates: Date[];
  maxDate: Date;
  onConfirm: (dates: Date[]) => void;
  onCancel: () => void;
};

function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function MultiDatePicker({
  startDate,
  selectedDates,
  maxDate,
  onConfirm,
  onCancel,
}: MultiDatePickerProps) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === "ar";
  const locale = isArabic ? "ar-SA" : "en-US";

  // Keep selections temporary until the user confirms them.
  const [draftDates, setDraftDates] = useState<Date[]>(() =>
    [...selectedDates].sort(
      (firstDate, secondDate) => firstDate.getTime() - secondDate.getTime(),
    ),
  );

  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(startDate.getFullYear(), startDate.getMonth(), 1),
  );

  const weekDays = isArabic
    ? ["أح", "إث", "ثل", "أر", "خم", "جم", "سب"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const monthTitle = visibleMonth.toLocaleDateString(locale, {
    calendar: "gregory",
    month: "long",
    year: "numeric",
  });

  const firstAllowedMonth = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    1,
  );

  const lastAllowedMonth = new Date(
    maxDate.getFullYear(),
    maxDate.getMonth(),
    1,
  );

  const canGoPrevious = visibleMonth.getTime() > firstAllowedMonth.getTime();

  const canGoNext = visibleMonth.getTime() < lastAllowedMonth.getTime();

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      1,
    );

    const startCalendarDate = new Date(firstDayOfMonth);

    startCalendarDate.setDate(
      firstDayOfMonth.getDate() - firstDayOfMonth.getDay(),
    );

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(startCalendarDate);

      date.setDate(startCalendarDate.getDate() + index);

      return date;
    });
  }, [visibleMonth]);

  const handlePreviousMonth = () => {
    if (!canGoPrevious) {
      return;
    }

    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    if (!canGoNext) {
      return;
    }

    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  };

  const handleToggleDate = (date: Date) => {
    const alreadySelected = draftDates.some((selectedDate) =>
      isSameDay(selectedDate, date),
    );

    if (alreadySelected) {
      setDraftDates((currentDates) =>
        currentDates.filter((selectedDate) => !isSameDay(selectedDate, date)),
      );

      return;
    }

    setDraftDates((currentDates) =>
      [...currentDates, date].sort(
        (firstDate, secondDate) => firstDate.getTime() - secondDate.getTime(),
      ),
    );
  };

  const handleConfirm = () => {
    onConfirm(draftDates);
  };

  return (
    <div className="multi-date-picker">
      <div className="multi-date-picker-header">
        <button
          type="button"
          className="multi-date-picker-arrow"
          onClick={handlePreviousMonth}
          disabled={!canGoPrevious}
          aria-label={t("planner.previousMonth")}
        >
          {isArabic ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        <strong>{monthTitle}</strong>

        <button
          type="button"
          className="multi-date-picker-arrow"
          onClick={handleNextMonth}
          disabled={!canGoNext}
          aria-label={t("planner.nextMonth")}
        >
          {isArabic ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <div className="multi-date-picker-weekdays">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="multi-date-picker-days">
        {calendarDays.map((date) => {
          const outsideMonth = date.getMonth() !== visibleMonth.getMonth();

          const selected = draftDates.some((selectedDate) =>
            isSameDay(selectedDate, date),
          );

          const isStartDate = isSameDay(date, startDate);

          const disabled = date < startDate || date > maxDate || isStartDate;

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled}
              className={[
                "multi-date-picker-day",
                outsideMonth ? "outside" : "",
                selected ? "selected" : "",
                isStartDate ? "selected" : "",
                isStartDate ? "start-date" : "",
                disabled ? "disabled" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleToggleDate(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {draftDates.length > 0 && (
        <div className="multi-date-picker-count">
          {t("dailyTask.selectedDatesCount", {
            count: draftDates.length,
          })}
        </div>
      )}

      <div className="multi-date-picker-actions">
        <button
          type="button"
          className="multi-date-picker-cancel"
          onClick={onCancel}
        >
          {t("dailyTask.cancelDates")}
        </button>

        <button
          type="button"
          className="multi-date-picker-confirm"
          onClick={handleConfirm}
        >
          {t("dailyTask.confirmDates")}
        </button>
      </div>
    </div>
  );
}

export default MultiDatePicker;
