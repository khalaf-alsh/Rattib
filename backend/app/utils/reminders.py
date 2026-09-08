from datetime import datetime, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from app.models.daily_task import DailyTaskInput


REMINDER_OFFSETS = {
    "atTime": timedelta(minutes=0),
    "10Minutes": timedelta(minutes=10),
    "15Minutes": timedelta(minutes=15),
    "30Minutes": timedelta(minutes=30),
    "1Hour": timedelta(hours=1),
}


def calculate_reminder_at(
    task: DailyTaskInput,
) -> datetime | None:
    if task.reminder == "none":
        return None

    if not task.timeZone:
        return None

    try:
        time_zone = ZoneInfo(task.timeZone)
    except ZoneInfoNotFoundError:
        raise ValueError("Invalid time zone")

    # مهمة بدون وقت بداية
    if task.reminder == "customTime":
        if task.reminderTime is None:
            raise ValueError(
                "Reminder time is required"
            )

        return datetime.combine(
            task.date,
            task.reminderTime,
            tzinfo=time_zone,
        )

    # مهمة لها Start Time
    if task.startTime is None:
        raise ValueError(
            "Start time is required for this reminder"
        )

    task_start = datetime.combine(
        task.date,
        task.startTime,
        tzinfo=time_zone,
    )

    offset = REMINDER_OFFSETS.get(task.reminder)

    if offset is None:
        raise ValueError(
            "Unsupported reminder type"
        )

    return task_start - offset