from datetime import time as TimeType

from pydantic import BaseModel, model_validator


class MeetingInput(BaseModel):
    day: str
    startTime: str
    endTime: str

    # Validate meeting times on the backend so invalid ranges
    # cannot bypass the checks performed by the frontend.
    @model_validator(mode="after")
    def validate_time_range(self):
        try:
            start_time = TimeType.fromisoformat(self.startTime)
            end_time = TimeType.fromisoformat(self.endTime)
        except ValueError as error:
            raise ValueError(
                "startTime and endTime must use a valid time format"
            ) from error

        if end_time <= start_time:
            raise ValueError(
                "endTime must be after startTime"
            )

        return self


class MeetingUpdateInput(BaseModel):
    originalMeeting: MeetingInput
    updatedMeeting: MeetingInput


class CourseInput(BaseModel):
    name: str
    doctor: str | None = None
    section: str | None = None
    building: str | None = None
    room: str | None = None
    meetings: list[MeetingInput]