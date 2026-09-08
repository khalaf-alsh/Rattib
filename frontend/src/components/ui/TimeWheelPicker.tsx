import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import "./TimeWheelPicker.css";

type TimeWheelPickerProps = {
  title: string;
  value?: string;
  onConfirm: (value: string) => void;
  onClear?: () => void;
  onClose: () => void;
};

type Period = "AM" | "PM";

type WheelColumnProps = {
  values: string[];
  selectedValue: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  renderValue?: (value: string) => string;
};

const ITEM_HEIGHT = 44;

function WheelColumn({
  values,
  selectedValue,
  onChange,
  ariaLabel,
  renderValue,
}: WheelColumnProps) {
  const wheelRef = useRef<HTMLDivElement>(null);

  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);

  const startYRef = useRef(0);
  const startScrollTopRef = useRef(0);

  const wheelTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const index = values.indexOf(selectedValue);

    if (index < 0 || !wheelRef.current) {
      return;
    }

    wheelRef.current.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: "auto",
    });
  }, [selectedValue, values]);

  useEffect(() => {
    return () => {
      if (wheelTimerRef.current !== null) {
        window.clearTimeout(wheelTimerRef.current);
      }
    };
  }, []);

  const snapToClosestItem = () => {
    if (!wheelRef.current) {
      return;
    }

    const rawIndex = Math.round(wheelRef.current.scrollTop / ITEM_HEIGHT);

    const index = Math.max(0, Math.min(values.length - 1, rawIndex));

    const value = values[index];

    onChange(value);

    wheelRef.current.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: "smooth",
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!wheelRef.current) {
      return;
    }

    isDraggingRef.current = true;
    hasMovedRef.current = false;

    startYRef.current = event.clientY;
    startScrollTopRef.current = wheelRef.current.scrollTop;

    wheelRef.current.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !wheelRef.current) {
      return;
    }

    const difference = event.clientY - startYRef.current;

    if (Math.abs(difference) > 4) {
      hasMovedRef.current = true;
    }

    wheelRef.current.scrollTop = startScrollTopRef.current - difference;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) {
      return;
    }

    isDraggingRef.current = false;

    if (wheelRef.current?.hasPointerCapture(event.pointerId)) {
      wheelRef.current.releasePointerCapture(event.pointerId);
    }

    snapToClosestItem();
  };

  const handleWheel = () => {
    if (wheelTimerRef.current !== null) {
      window.clearTimeout(wheelTimerRef.current);
    }

    wheelTimerRef.current = window.setTimeout(() => {
      snapToClosestItem();
    }, 120);
  };

  const handleItemClick = (value: string, index: number) => {
    if (hasMovedRef.current) {
      hasMovedRef.current = false;
      return;
    }

    onChange(value);

    wheelRef.current?.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: "smooth",
    });
  };

  return (
    <div
      ref={wheelRef}
      className="time-wheel-column"
      aria-label={ariaLabel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      {values.map((value, index) => (
        <button
          key={value}
          type="button"
          className={`time-wheel-item ${
            selectedValue === value ? "selected" : ""
          }`}
          onClick={() => handleItemClick(value, index)}
        >
          {renderValue ? renderValue(value) : value}
        </button>
      ))}
    </div>
  );
}

function getInitialTime(value?: string) {
  if (value) {
    const [hour24, minute] = value.split(":").map(Number);

    const period: Period = hour24 >= 12 ? "PM" : "AM";

    const hour12 = hour24 % 12 || 12;

    return {
      hour: String(hour12).padStart(2, "0"),
      minute: String(minute).padStart(2, "0"),
      period,
    };
  }

  const now = new Date();
  const hour24 = now.getHours();

  const period: Period = hour24 >= 12 ? "PM" : "AM";

  const hour12 = hour24 % 12 || 12;

  return {
    hour: String(hour12).padStart(2, "0"),
    minute: String(now.getMinutes()).padStart(2, "0"),
    period,
  };
}

function TimeWheelPicker({
  title,
  value,
  onConfirm,
  onClear,
  onClose,
}: TimeWheelPickerProps) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === "ar";

  const initialTime = useMemo(() => getInitialTime(value), [value]);

  const [hour, setHour] = useState(initialTime.hour);
  const [minute, setMinute] = useState(initialTime.minute);
  const [period, setPeriod] = useState<Period>(initialTime.period);

  const hours = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) =>
        String(index + 1).padStart(2, "0"),
      ),
    [],
  );

  const minutes = useMemo(
    () =>
      Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0")),
    [],
  );

  const periodValues: Period[] = ["AM", "PM"];

  const getPeriodLabel = (value: string) => {
    if (isArabic) {
      return value === "AM" ? "ص" : "م";
    }

    return value;
  };

  const handleConfirm = () => {
    let hour24 = Number(hour);

    if (period === "AM") {
      if (hour24 === 12) {
        hour24 = 0;
      }
    } else if (hour24 !== 12) {
      hour24 += 12;
    }

    const formattedHour = String(hour24).padStart(2, "0");

    onConfirm(`${formattedHour}:${minute}`);
  };

  return (
    <div className="time-wheel-overlay" onClick={onClose}>
      <div
        className="time-wheel-picker"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="time-wheel-header">
          <h3>{title}</h3>

          <button
            type="button"
            className="time-wheel-close"
            onClick={onClose}
            aria-label={t("close")}
          >
            <X size={22} />
          </button>
        </div>

        {isArabic ? (
          <>
            <div className="time-wheel-labels" dir="ltr">
              <span>الفترة</span>
              <span>الساعة</span>
              <span>الدقيقة</span>
            </div>

            <div className="time-wheel-body" dir="ltr">
              <div className="time-wheel-selection" />

              <WheelColumn
                values={periodValues}
                selectedValue={period}
                onChange={(newPeriod) => setPeriod(newPeriod as Period)}
                ariaLabel="Period"
                renderValue={getPeriodLabel}
              />

              <WheelColumn
                values={hours}
                selectedValue={hour}
                onChange={setHour}
                ariaLabel="Hour"
              />

              <WheelColumn
                values={minutes}
                selectedValue={minute}
                onChange={setMinute}
                ariaLabel="Minute"
              />
            </div>
          </>
        ) : (
          <>
            <div className="time-wheel-labels" dir="ltr">
              <span>Hour</span>
              <span>Minute</span>
              <span>Period</span>
            </div>

            <div className="time-wheel-body" dir="ltr">
              <div className="time-wheel-selection" />

              <WheelColumn
                values={hours}
                selectedValue={hour}
                onChange={setHour}
                ariaLabel="Hour"
              />

              <WheelColumn
                values={minutes}
                selectedValue={minute}
                onChange={setMinute}
                ariaLabel="Minute"
              />

              <WheelColumn
                values={periodValues}
                selectedValue={period}
                onChange={(newPeriod) => setPeriod(newPeriod as Period)}
                ariaLabel="Period"
                renderValue={getPeriodLabel}
              />
            </div>
          </>
        )}

        <div className="time-wheel-preview">
          {hour}:{minute} {getPeriodLabel(period)}
        </div>

        <div className="time-wheel-actions">
          {onClear && (
            <button
              type="button"
              className="time-wheel-clear"
              onClick={onClear}
            >
              {t("timeWheel.clear")}
            </button>
          )}

          <button
            type="button"
            className="time-wheel-confirm"
            onClick={handleConfirm}
          >
            {t("timeWheel.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimeWheelPicker;
