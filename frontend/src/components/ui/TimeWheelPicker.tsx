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
  circular?: boolean;
};

// Each wheel option has a fixed height so scroll positions
// can be converted directly into selected item indexes.
const ITEM_HEIGHT = 44;

// Circular wheels repeat their values several times and keep
// the user near the middle copy to simulate infinite scrolling.
const CIRCULAR_COPIES = 7;
const CIRCULAR_CENTER_COPY = Math.floor(CIRCULAR_COPIES / 2);

const PERIOD_VALUES: Period[] = ["AM", "PM"];

// Wraps an index back into the valid range of the original values.
// This is used when selecting items from repeated circular copies.
function getWrappedIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function WheelColumn({
  values,
  selectedValue,
  onChange,
  ariaLabel,
  renderValue,
  circular = false,
}: WheelColumnProps) {
  const wheelRef = useRef<HTMLDivElement>(null);

  // Refs track drag interaction without causing React re-renders
  // during every pointer movement.
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);

  const startYRef = useRef(0);
  const startScrollTopRef = useRef(0);

  // Timers delay snapping and circular recentering until
  // the user's scrolling interaction has finished.
  const wheelTimerRef = useRef<number | null>(null);

  const recenterTimerRef = useRef<number | null>(null);

  // Prevents a value update from immediately resetting the scroll
  // position while a smooth user-initiated scroll is still running.
  const suppressNextSyncRef = useRef(false);

  // Circular columns repeat their values several times so the user
  // can scroll across boundaries without reaching a visible end.
  const displayValues = useMemo(() => {
    if (!circular) {
      return values;
    }

    return Array.from({ length: CIRCULAR_COPIES }, () => values).flat();
  }, [circular, values]);

  // Returns the scrollable index that should represent a value.
  // Circular wheels use the middle repeated copy as their default position.
  const getCenteredIndex = (value: string) => {
    const baseIndex = values.indexOf(value);

    if (baseIndex < 0) {
      return -1;
    }

    if (!circular) {
      return baseIndex;
    }

    return CIRCULAR_CENTER_COPY * values.length + baseIndex;
  };

  // Keep the wheel position synchronized when the selected value
  // is changed externally by the parent component.
  useEffect(() => {
    if (suppressNextSyncRef.current) {
      suppressNextSyncRef.current = false;

      return;
    }

    const index = getCenteredIndex(selectedValue);

    if (index < 0 || !wheelRef.current) {
      return;
    }

    wheelRef.current.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: "auto",
    });
  }, [selectedValue, values, circular]);

  // Clear pending timers when the wheel is removed.
  useEffect(() => {
    return () => {
      if (wheelTimerRef.current !== null) {
        window.clearTimeout(wheelTimerRef.current);
      }

      if (recenterTimerRef.current !== null) {
        window.clearTimeout(recenterTimerRef.current);
      }
    };
  }, []);

  // After circular scrolling finishes, move the selected logical value
  // back to the center copy so more scrolling remains available both ways.
  const scheduleCircularRecenter = (logicalIndex: number) => {
    if (!circular) {
      return;
    }

    if (recenterTimerRef.current !== null) {
      window.clearTimeout(recenterTimerRef.current);
    }

    recenterTimerRef.current = window.setTimeout(() => {
      if (!wheelRef.current) {
        return;
      }

      // Move to the identical item in the middle copy.
      // Because the visible values are identical, this reset
      // happens without a noticeable visual jump.
      const centeredIndex = CIRCULAR_CENTER_COPY * values.length + logicalIndex;

      wheelRef.current.scrollTo({
        top: centeredIndex * ITEM_HEIGHT,
        behavior: "auto",
      });
    }, 180);
  };

  // Selects one rendered wheel index, converts circular copies
  // back to their logical value, and snaps the wheel to that item.
  const selectIndex = (
    rawIndex: number,
    behavior: ScrollBehavior = "smooth",
  ) => {
    if (!wheelRef.current || values.length === 0) {
      return;
    }

    const maxIndex = displayValues.length - 1;

    const index = Math.max(0, Math.min(maxIndex, rawIndex));

    const logicalIndex = circular
      ? getWrappedIndex(index, values.length)
      : index;

    const value = values[logicalIndex];

    if (value !== selectedValue) {
      // Prevent the selected-value effect from interrupting
      // the current smooth scroll animation.
      suppressNextSyncRef.current = true;

      onChange(value);
    }

    wheelRef.current.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior,
    });

    scheduleCircularRecenter(logicalIndex);
  };

  // Rounds the current scroll position to the nearest full option.
  const snapToClosestItem = () => {
    if (!wheelRef.current) {
      return;
    }

    const rawIndex = Math.round(wheelRef.current.scrollTop / ITEM_HEIGHT);

    selectIndex(rawIndex);
  };

  // Starts custom pointer dragging and remembers the wheel's
  // starting position for manual vertical scrolling.
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

  // Translate pointer movement into wheel scrolling while dragging.
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

  // Finish dragging, release pointer capture, and snap to
  // the closest valid wheel option.
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

  // Mouse-wheel scrolling is allowed freely first, then snapped
  // to the nearest item after a short period of inactivity.
  const handleWheel = () => {
    if (wheelTimerRef.current !== null) {
      window.clearTimeout(wheelTimerRef.current);
    }

    wheelTimerRef.current = window.setTimeout(() => {
      snapToClosestItem();
    }, 120);
  };

  // Select an option directly when clicked, unless the click
  // was generated immediately after a drag interaction.
  const handleItemClick = (value: string, index: number) => {
    if (hasMovedRef.current) {
      hasMovedRef.current = false;
      return;
    }

    const logicalIndex = circular
      ? getWrappedIndex(index, values.length)
      : index;

    if (value !== selectedValue) {
      suppressNextSyncRef.current = true;

      onChange(value);
    }

    wheelRef.current?.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: "smooth",
    });

    scheduleCircularRecenter(logicalIndex);
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
      {displayValues.map((value, index) => (
        <button
          key={`${value}-${index}`}
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

// Converts an existing stored 24-hour value into 12-hour picker fields.
// When no value exists, the current local device time is used instead.
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

  // Initialize picker state from the saved value or the current time.
  const initialTime = useMemo(() => getInitialTime(value), [value]);

  const [hour, setHour] = useState(initialTime.hour);

  const [minute, setMinute] = useState(initialTime.minute);

  const [period, setPeriod] = useState<Period>(initialTime.period);

  // Generate the selectable hour and minute values only once.
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

  // AM/PM remain internal values while Arabic displays
  // their localized short forms to the user.
  const getPeriodLabel = (value: string) => {
    if (isArabic) {
      return value === "AM" ? "ص" : "م";
    }

    return value;
  };

  // Convert the selected 12-hour picker values back into
  // the 24-hour HH:MM format used internally by Rattib.
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
    <div
      className="time-wheel-overlay"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
    >
      <div
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onClose();
          }
        }}
        className="time-wheel-picker"
        role="dialog"
        aria-modal="true"
        aria-label={title}
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

        {/* Arabic uses period-hour-minute ordering while English
            uses hour-minute-period, with both wheel bodies kept LTR
            so numeric scrolling remains consistent. */}
        {isArabic ? (
          <>
            <div className="time-wheel-labels" dir="ltr">
              <span>{t("timeWheel.period")}</span>

              <span>{t("timeWheel.hour")}</span>

              <span>{t("timeWheel.minute")}</span>
            </div>

            <div className="time-wheel-body" dir="ltr">
              <div className="time-wheel-selection" />

              <WheelColumn
                values={PERIOD_VALUES}
                selectedValue={period}
                onChange={(newPeriod) => setPeriod(newPeriod as Period)}
                ariaLabel={t("timeWheel.period")}
                renderValue={getPeriodLabel}
              />

              <WheelColumn
                values={hours}
                selectedValue={hour}
                onChange={setHour}
                ariaLabel={t("timeWheel.hour")}
                circular
              />

              <WheelColumn
                values={minutes}
                selectedValue={minute}
                onChange={setMinute}
                ariaLabel={t("timeWheel.minute")}
                circular
              />
            </div>
          </>
        ) : (
          <>
            <div className="time-wheel-labels" dir="ltr">
              <span>{t("timeWheel.hour")}</span>

              <span>{t("timeWheel.minute")}</span>

              <span>{t("timeWheel.period")}</span>
            </div>

            <div className="time-wheel-body" dir="ltr">
              <div className="time-wheel-selection" />

              <WheelColumn
                values={hours}
                selectedValue={hour}
                onChange={setHour}
                ariaLabel={t("timeWheel.hour")}
                circular
              />

              <WheelColumn
                values={minutes}
                selectedValue={minute}
                onChange={setMinute}
                ariaLabel={t("timeWheel.minute")}
                circular
              />

              <WheelColumn
                values={PERIOD_VALUES}
                selectedValue={period}
                onChange={(newPeriod) => setPeriod(newPeriod as Period)}
                ariaLabel={t("timeWheel.period")}
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
