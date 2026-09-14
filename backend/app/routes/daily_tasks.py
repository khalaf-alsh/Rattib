from datetime import timedelta
from uuid import uuid4
from typing import Literal
import httpx

from fastapi import APIRouter, Depends, HTTPException, Response

from app.config import SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY
from app.dependencies.auth import get_authenticated_user
from app.models.daily_task import (
    DailyTaskCompletionInput,
    DailyTaskInput,
)
from app.utils.reminders import calculate_reminder_at


router = APIRouter(
    prefix="/api/daily-tasks",
    tags=["Daily Tasks"],
)

def normalize_db_time(value: str | None) -> str | None:
    # Normalize Supabase time values such as "21:30:00" to "21:30"
    # so they can be compared with the incoming task values.
    if value is None:
        return None

    return value[:5]

def build_occurrence_dates(task: DailyTaskInput):
    # Build all dates for a recurring task.
    # The task's own date is always the first occurrence.
    if task.seriesType == "single":
        return [task.date]

    if task.seriesType == "daily":
        dates = []
        current_date = task.date

        while current_date <= task.repeatUntil:
            dates.append(current_date)
            current_date += timedelta(days=1)

        return dates

    if task.seriesType == "weekly":
        dates = []
        current_date = task.date

        while current_date <= task.repeatUntil:
            dates.append(current_date)
            current_date += timedelta(days=7)

        return dates

    if task.seriesType == "customDates":
        return sorted(
            set(
                [
                    task.date,
                    *task.customDates,
                ]
            )
        )

    return [task.date]

@router.get("")
async def get_daily_tasks(
    auth=Depends(get_authenticated_user),
):
    access_token, _ = auth

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {access_token}",
    }

    params = {
        "select": (
            "id,"
            "title,"
            "task_date,"
            "start_time,"
            "end_time,"
            "notes,"
            "reminder,"
            "reminder_time,"
            "reminder_at,"
            "time_zone,"
                "series_id,"
    "series_type,"
            "completed"
        ),
        "order": "task_date.asc,start_time.asc",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/daily_tasks",
            headers=headers,
            params=params,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail="Failed to load daily tasks",
        )

    return response.json()


@router.post("", status_code=201)
async def create_daily_task(
    task: DailyTaskInput,
    auth=Depends(get_authenticated_user),
):
    access_token, user = auth

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    occurrence_dates = build_occurrence_dates(task)

    series_id = (
        str(uuid4())
        if task.seriesType != "single"
        else None
    )

    tasks_data = []

    for occurrence_date in occurrence_dates:
        # Calculate each reminder using the occurrence's own date.
        occurrence_task = task.model_copy(
            update={
                "date": occurrence_date,
            }
        )

        try:
            reminder_at = calculate_reminder_at(
                occurrence_task
            )
        except ValueError as error:
            raise HTTPException(
                status_code=422,
                detail=str(error),
            )

        task_data = {
            "user_id": user.id,
            "title": task.title,
            "task_date": occurrence_date.isoformat(),

            "start_time": (
                task.startTime.isoformat(timespec="minutes")
                if task.startTime
                else None
            ),

            "end_time": (
                task.endTime.isoformat(timespec="minutes")
                if task.endTime
                else None
            ),

            "notes": task.notes,

            "reminder": task.reminder,

            "reminder_time": (
                task.reminderTime.isoformat(timespec="minutes")
                if task.reminderTime
                else None
            ),

            "reminder_at": (
                reminder_at.isoformat()
                if reminder_at
                else None
            ),

            "reminder_sent_at": None,

            "time_zone": task.timeZone,

            "completed": False,

            "series_id": series_id,
            "series_type": task.seriesType,
        }

        tasks_data.append(task_data)

    async with httpx.AsyncClient() as client:
        # Supabase REST accepts an array to insert the whole
        # recurring series in a single database request.
        response = await client.post(
            f"{SUPABASE_URL}/rest/v1/daily_tasks",
            headers=headers,
            json=tasks_data,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail="Failed to create daily task",
        )

    created_rows = response.json()

    if not created_rows:
        raise HTTPException(
            status_code=500,
            detail="Daily task was not returned after creation",
        )

    # Keep the current API response compatible with the frontend.
    # The frontend will reload the full series after recurring-task
    # controls are added.
    return created_rows[0]

@router.put("/{task_id}")
async def update_daily_task(
    task_id: int,
    task: DailyTaskInput,
    auth=Depends(get_authenticated_user),
):
    access_token, _ = auth

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    try:
        reminder_at = calculate_reminder_at(task)
    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        )

    new_start_time = (
        task.startTime.isoformat(timespec="minutes")
        if task.startTime
        else None
    )

    new_end_time = (
        task.endTime.isoformat(timespec="minutes")
        if task.endTime
        else None
    )

    new_reminder_time = (
        task.reminderTime.isoformat(timespec="minutes")
        if task.reminderTime
        else None
    )

    async with httpx.AsyncClient() as client:
        # Load the existing reminder schedule before updating the task.
        existing_response = await client.get(
            f"{SUPABASE_URL}/rest/v1/daily_tasks",
            headers=headers,
            params={
                "id": f"eq.{task_id}",
                "select": (
                    "task_date,"
                    "start_time,"
                    "reminder,"
                    "reminder_time,"
                    "time_zone"
                ),
            },
        )

        if existing_response.status_code >= 400:
            raise HTTPException(
                status_code=existing_response.status_code,
                detail="Failed to load daily task",
            )

        existing_rows = existing_response.json()

        if not existing_rows:
            raise HTTPException(
                status_code=404,
                detail="Daily task not found",
            )

        existing_task = existing_rows[0]

        # Reset reminder_sent_at only when the reminder schedule changes.
        reminder_schedule_changed = any(
            [
                existing_task["task_date"]
                != task.date.isoformat(),
                normalize_db_time(existing_task["start_time"])
                != new_start_time,
                existing_task["reminder"]
                != task.reminder,
                normalize_db_time(existing_task["reminder_time"])
                != new_reminder_time,
                existing_task["time_zone"]
                != task.timeZone,
            ]
        )

        task_data = {
            "title": task.title,
            "task_date": task.date.isoformat(),
            "start_time": new_start_time,
            "end_time": new_end_time,
            "notes": task.notes,
            "reminder": task.reminder,
            "reminder_time": new_reminder_time,
            "reminder_at": (
                reminder_at.isoformat()
                if reminder_at
                else None
            ),
            "time_zone": task.timeZone,
        }

        if reminder_schedule_changed:
            task_data["reminder_sent_at"] = None

        response = await client.patch(
            f"{SUPABASE_URL}/rest/v1/daily_tasks?id=eq.{task_id}",
            headers=headers,
            json=task_data,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail="Failed to update daily task",
        )

    updated_rows = response.json()

    if not updated_rows:
        raise HTTPException(
            status_code=404,
            detail="Daily task not found",
        )

    return updated_rows[0]

@router.patch("/{task_id}/completion")
async def update_daily_task_completion(
    task_id: int,
    completion: DailyTaskCompletionInput,
    auth=Depends(get_authenticated_user),
):
    access_token, _ = auth

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    async with httpx.AsyncClient() as client:
        response = await client.patch(
            f"{SUPABASE_URL}/rest/v1/daily_tasks?id=eq.{task_id}",
            headers=headers,
            json={
                "completed": completion.completed,
            },
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail="Failed to update task completion",
        )

    updated_rows = response.json()

    if not updated_rows:
        raise HTTPException(
            status_code=404,
            detail="Daily task not found",
        )

    return updated_rows[0]


@router.delete("/{task_id}", status_code=204)
async def delete_daily_task(
    task_id: int,
    scope: Literal["single", "series"] = "single",
    auth=Depends(get_authenticated_user),
):
    access_token, _ = auth

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    async with httpx.AsyncClient() as client:
        if scope == "single":
            # Delete only the selected occurrence.
            response = await client.delete(
                f"{SUPABASE_URL}/rest/v1/daily_tasks",
                headers=headers,
                params={
                    "id": f"eq.{task_id}",
                },
            )

        else:
            # Read the selected occurrence first to find its series.
            task_response = await client.get(
                f"{SUPABASE_URL}/rest/v1/daily_tasks",
                headers=headers,
                params={
                    "id": f"eq.{task_id}",
                    "select": "id,series_id",
                },
            )

            if task_response.status_code >= 400:
                raise HTTPException(
                    status_code=task_response.status_code,
                    detail="Failed to read daily task",
                )

            rows = task_response.json()

            if not rows:
                raise HTTPException(
                    status_code=404,
                    detail="Daily task not found",
                )

            series_id = rows[0].get("series_id")

            # A normal task has no series, so delete only that task.
            if not series_id:
                response = await client.delete(
                    f"{SUPABASE_URL}/rest/v1/daily_tasks",
                    headers=headers,
                    params={
                        "id": f"eq.{task_id}",
                    },
                )
            else:
                # Delete every occurrence linked to the same series.
                response = await client.delete(
                    f"{SUPABASE_URL}/rest/v1/daily_tasks",
                    headers=headers,
                    params={
                        "series_id": f"eq.{series_id}",
                    },
                )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail="Failed to delete daily task",
        )

    deleted_rows = response.json()

    if not deleted_rows:
        raise HTTPException(
            status_code=404,
            detail="Daily task not found",
        )

    return Response(status_code=204)