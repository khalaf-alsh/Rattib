from datetime import date as DateType
from datetime import time as TimeType
from typing import Literal

from pydantic import BaseModel, model_validator


TaskReminder = Literal[
    "none",
    "atTime",
    "10Minutes",
    "15Minutes",
    "30Minutes",
    "1Hour",
    "customTime",
]


class DailyTaskInput(BaseModel):
    title: str
    date: DateType

    startTime: TimeType | None = None
    endTime: TimeType | None = None

    notes: str | None = None

    reminder: TaskReminder = "none"

    # يستخدم فقط إذا كانت المهمة بدون Start Time
    reminderTime: TimeType | None = None

    # مثال: Asia/Riyadh
    timeZone: str | None = None

    @model_validator(mode="after")
    def validate_reminder(self):
        # لا يوجد تذكير
        if self.reminder == "none":
            self.reminderTime = None
            return self

        # أي تذكير فعلي يحتاج Time Zone
        if not self.timeZone:
            raise ValueError(
                "timeZone is required when a reminder is enabled"
            )

        # مهمة بدون وقت بداية
        if self.startTime is None:
            if self.reminder != "customTime":
                raise ValueError(
                    "Untimed tasks must use customTime reminder"
                )

            if self.reminderTime is None:
                raise ValueError(
                    "reminderTime is required for untimed tasks"
                )

            return self

        # مهمة لها وقت بداية
        if self.reminder == "customTime":
            raise ValueError(
                "Timed tasks cannot use customTime reminder"
            )

        if self.reminderTime is not None:
            raise ValueError(
                "reminderTime is only allowed for untimed tasks"
            )

        return self


class DailyTaskCompletionInput(BaseModel):
    completed: bool