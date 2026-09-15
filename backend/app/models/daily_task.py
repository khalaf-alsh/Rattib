from datetime import date as DateType
from datetime import time as TimeType
from datetime import timedelta
from typing import Literal

from pydantic import BaseModel, Field, model_validator


TaskReminder = Literal[
    "none",
    "atTime",
    "10Minutes",
    "15Minutes",
    "30Minutes",
    "1Hour",
    "customTime",
]

TaskSeriesType = Literal[
    "single",
    "daily",
    "weekly",
    "customDates",
]


class DailyTaskInput(BaseModel):
    title: str
    date: DateType

    startTime: TimeType | None = None
    endTime: TimeType | None = None

    notes: str | None = None

    reminder: TaskReminder = "none"
    reminderTime: TimeType | None = None
    timeZone: str | None = None

    seriesType: TaskSeriesType = "single"

    # Used only for daily and weekly recurrence.
    repeatUntil: DateType | None = None

    # Used only when the user manually selects multiple dates.
    customDates: list[DateType] = Field(default_factory=list)

    # Run all cross-field validation after Pydantic has parsed
    # the individual request values into their expected types.
    @model_validator(mode="after")
    def validate_task(self):
        self.validate_time_range()
        self.validate_reminder()
        self.validate_recurrence()

        return self

    # Ensure task time ranges remain logically valid even when
    # the API is called directly without frontend validation.
    def validate_time_range(self):
        if self.endTime is not None and self.startTime is None:
            raise ValueError(
                "startTime is required when endTime is provided"
            )

        if (
            self.startTime is not None
            and self.endTime is not None
            and self.endTime <= self.startTime
        ):
            raise ValueError(
                "endTime must be after startTime"
            )

    # Validate the relationship between reminder fields and
    # whether the task itself has a scheduled start time.
    def validate_reminder(self):
        if self.reminder == "none":
            self.reminderTime = None
            return

        if not self.timeZone:
            raise ValueError(
                "timeZone is required when a reminder is enabled"
            )

        if self.startTime is None:
            if self.reminder != "customTime":
                raise ValueError(
                    "Untimed tasks must use customTime reminder"
                )

            if self.reminderTime is None:
                raise ValueError(
                    "reminderTime is required for untimed tasks"
                )

            return

        if self.reminder == "customTime":
            raise ValueError(
                "Timed tasks cannot use customTime reminder"
            )

        if self.reminderTime is not None:
            raise ValueError(
                "reminderTime is only allowed for untimed tasks"
            )

    # Validate recurrence-specific values and enforce the
    # application's maximum 30-day recurrence window.
    def validate_recurrence(self):
        # A normal task does not need recurrence-specific values.
        if self.seriesType == "single":
            self.repeatUntil = None
            self.customDates = []
            return

        max_date = self.date + timedelta(days=30)

        if self.seriesType in ("daily", "weekly"):
            if self.repeatUntil is None:
                raise ValueError(
                    "repeatUntil is required for recurring tasks"
                )

            if self.repeatUntil < self.date:
                raise ValueError(
                    "repeatUntil cannot be before the task date"
                )

            if self.repeatUntil > max_date:
                raise ValueError(
                    "Recurring tasks cannot exceed 30 days"
                )

            self.customDates = []
            return

        if self.seriesType == "customDates":
            self.repeatUntil = None

            if not self.customDates:
                raise ValueError(
                    "At least one additional date is required"
                )

            # Remove duplicates and keep the dates sorted.
            self.customDates = sorted(set(self.customDates))

            for custom_date in self.customDates:
                if custom_date < self.date:
                    raise ValueError(
                        "Custom dates cannot be before the task date"
                    )

                if custom_date > max_date:
                    raise ValueError(
                        "Custom dates cannot exceed 30 days"
                    )


class DailyTaskCompletionInput(BaseModel):
    completed: bool