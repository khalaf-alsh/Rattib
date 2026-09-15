import httpx

from fastapi import APIRouter, Depends, HTTPException

from app.config import SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY
from app.dependencies.auth import get_authenticated_user
from app.models.schedule import (
    CourseInput,
    MeetingUpdateInput,
)


router = APIRouter(
    prefix="/api/courses",
    tags=["Courses"],
)


# Load all courses and their meetings for the authenticated user.
@router.get("")
async def get_courses(
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
            "name,"
            "doctor,"
            "section,"
            "building,"
            "room,"
            "meetings(day,start_time,end_time)"
        )
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/courses",
            headers=headers,
            params=params,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail="Failed to load courses",
        )

    return response.json()


# Create a course and its associated meeting rows.
@router.post("", status_code=201)
async def create_course(
    course: CourseInput,
    auth=Depends(get_authenticated_user),
):
    access_token, user = auth

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    course_data = {
        "user_id": user.id,
        "name": course.name,
        "doctor": course.doctor,
        "section": course.section,
        "building": course.building,
        "room": course.room,
    }

    async with httpx.AsyncClient() as client:
        course_response = await client.post(
            f"{SUPABASE_URL}/rest/v1/courses",
            headers=headers,
            json=course_data,
        )

        if course_response.status_code >= 400:
            raise HTTPException(
                status_code=course_response.status_code,
                detail="Failed to create course",
            )

        created_course = course_response.json()[0]
        course_id = created_course["id"]

        meetings_data = [
            {
                "course_id": course_id,
                "day": meeting.day,
                "start_time": meeting.startTime,
                "end_time": meeting.endTime,
            }
            for meeting in course.meetings
        ]

        meetings_response = await client.post(
            f"{SUPABASE_URL}/rest/v1/meetings",
            headers=headers,
            json=meetings_data,
        )

        # Remove the newly created course if its meetings
        # cannot be saved, keeping the database consistent.
        if meetings_response.status_code >= 400:
            await client.delete(
                f"{SUPABASE_URL}/rest/v1/courses?id=eq.{course_id}",
                headers=headers,
            )

            raise HTTPException(
                status_code=meetings_response.status_code,
                detail="Failed to create course meetings",
            )

    return {
        "id": course_id,
        "name": course.name,
        "doctor": course.doctor,
        "section": course.section,
        "building": course.building,
        "room": course.room,
        "meetings": [
            {
                "day": meeting.day,
                "start_time": meeting.startTime,
                "end_time": meeting.endTime,
            }
            for meeting in course.meetings
        ],
    }


# Replace the course information and its complete meeting list.
@router.put("/{course_id}")
async def update_course(
    course_id: int,
    course: CourseInput,
    auth=Depends(get_authenticated_user),
):
    access_token, _ = auth

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    course_data = {
        "name": course.name,
        "doctor": course.doctor,
        "section": course.section,
        "building": course.building,
        "room": course.room,
    }

    async with httpx.AsyncClient() as client:
        # Load the existing state before changing anything so it can
        # be restored if one of the later update operations fails.
        existing_response = await client.get(
            f"{SUPABASE_URL}/rest/v1/courses?id=eq.{course_id}",
            headers=headers,
            params={
                "select": (
                    "name,"
                    "doctor,"
                    "section,"
                    "building,"
                    "room,"
                    "meetings(day,start_time,end_time)"
                )
            },
        )

        if existing_response.status_code >= 400:
            raise HTTPException(
                status_code=existing_response.status_code,
                detail="Failed to load existing course",
            )

        existing_rows = existing_response.json()

        if not existing_rows:
            raise HTTPException(
                status_code=404,
                detail="Course not found",
            )

        existing_course = existing_rows[0]

        previous_course_data = {
            "name": existing_course["name"],
            "doctor": existing_course["doctor"],
            "section": existing_course["section"],
            "building": existing_course["building"],
            "room": existing_course["room"],
        }

        previous_meetings_data = [
            {
                "course_id": course_id,
                "day": meeting["day"],
                "start_time": meeting["start_time"],
                "end_time": meeting["end_time"],
            }
            for meeting in existing_course.get("meetings", [])
        ]

        course_response = await client.patch(
            f"{SUPABASE_URL}/rest/v1/courses?id=eq.{course_id}",
            headers=headers,
            json=course_data,
        )

        if course_response.status_code >= 400:
            raise HTTPException(
                status_code=course_response.status_code,
                detail="Failed to update course",
            )

        delete_response = await client.delete(
            f"{SUPABASE_URL}/rest/v1/meetings?course_id=eq.{course_id}",
            headers=headers,
        )

        if delete_response.status_code >= 400:
            # The meeting deletion failed, so restore the course
            # information that was already changed above.
            rollback_response = await client.patch(
                f"{SUPABASE_URL}/rest/v1/courses?id=eq.{course_id}",
                headers=headers,
                json=previous_course_data,
            )

            if rollback_response.status_code >= 400:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to update course and restore previous state",
                )

            raise HTTPException(
                status_code=delete_response.status_code,
                detail="Failed to update course meetings",
            )

        meetings_data = [
            {
                "course_id": course_id,
                "day": meeting.day,
                "start_time": meeting.startTime,
                "end_time": meeting.endTime,
            }
            for meeting in course.meetings
        ]

        meetings_response = await client.post(
            f"{SUPABASE_URL}/rest/v1/meetings",
            headers=headers,
            json=meetings_data,
        )

        if meetings_response.status_code >= 400:
            # Restore both the previous course information and
            # its meeting list if saving the replacement meetings fails.
            rollback_course_response = await client.patch(
                f"{SUPABASE_URL}/rest/v1/courses?id=eq.{course_id}",
                headers=headers,
                json=previous_course_data,
            )

            rollback_delete_response = await client.delete(
                f"{SUPABASE_URL}/rest/v1/meetings?course_id=eq.{course_id}",
                headers=headers,
            )

            rollback_meetings_response = None

            if (
                rollback_delete_response.status_code < 400
                and previous_meetings_data
            ):
                rollback_meetings_response = await client.post(
                    f"{SUPABASE_URL}/rest/v1/meetings",
                    headers=headers,
                    json=previous_meetings_data,
                )

            rollback_failed = (
                rollback_course_response.status_code >= 400
                or rollback_delete_response.status_code >= 400
                or (
                    rollback_meetings_response is not None
                    and rollback_meetings_response.status_code >= 400
                )
            )

            if rollback_failed:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to update course and restore previous state",
                )

            raise HTTPException(
                status_code=meetings_response.status_code,
                detail="Failed to save updated meetings",
            )

    return {
        "id": course_id,
        "name": course.name,
        "doctor": course.doctor,
        "section": course.section,
        "building": course.building,
        "room": course.room,
        "meetings": [
            {
                "day": meeting.day,
                "start_time": meeting.startTime,
                "end_time": meeting.endTime,
            }
            for meeting in course.meetings
        ],
    }


# Update one specific meeting while keeping the rest unchanged.
@router.patch("/{course_id}/meeting")
async def update_course_meeting(
    course_id: int,
    meeting_update: MeetingUpdateInput,
    auth=Depends(get_authenticated_user),
):
    access_token, _ = auth

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    original = meeting_update.originalMeeting
    updated = meeting_update.updatedMeeting

    meeting_data = {
        "day": updated.day,
        "start_time": updated.startTime,
        "end_time": updated.endTime,
    }

    url = (
        f"{SUPABASE_URL}/rest/v1/meetings"
        f"?course_id=eq.{course_id}"
        f"&day=eq.{original.day}"
        f"&start_time=eq.{original.startTime}"
        f"&end_time=eq.{original.endTime}"
    )

    async with httpx.AsyncClient() as client:
        response = await client.patch(
            url,
            headers=headers,
            json=meeting_data,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail="Failed to update meeting",
        )

    updated_rows = response.json()

    if not updated_rows:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    updated_row = updated_rows[0]

    return {
        "day": updated_row["day"],
        "start_time": updated_row["start_time"],
        "end_time": updated_row["end_time"],
    }


# Delete a course. Related meetings are removed through
# the database relationship configured for the course.
@router.delete("/{course_id}", status_code=204)
async def delete_course(
    course_id: int,
    auth=Depends(get_authenticated_user),
):
    access_token, _ = auth

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {access_token}",
    }

    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"{SUPABASE_URL}/rest/v1/courses?id=eq.{course_id}",
            headers=headers,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail="Failed to delete course",
        )


# Delete one meeting identified by its original schedule values.
@router.delete("/{course_id}/meeting", status_code=204)
async def delete_course_meeting(
    course_id: int,
    day: str,
    start_time: str,
    end_time: str,
    auth=Depends(get_authenticated_user),
):
    access_token, _ = auth

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {access_token}",
    }

    url = (
        f"{SUPABASE_URL}/rest/v1/meetings"
        f"?course_id=eq.{course_id}"
        f"&day=eq.{day}"
        f"&start_time=eq.{start_time}"
        f"&end_time=eq.{end_time}"
    )

    async with httpx.AsyncClient() as client:
        response = await client.delete(
            url,
            headers=headers,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail="Failed to delete meeting",
        )