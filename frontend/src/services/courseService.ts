import { apiFetch } from "../lib/apiClient";
import type { Course, Day, Meeting, NewCourse } from "../types/schedule";

type BackendMeeting = {
  day: Day;
  start_time: string;
  end_time: string;
};

type BackendCourse = {
  id: number;
  name: string;
  doctor: string | null;
  section: string | null;
  building: string | null;
  room: string | null;
  meetings: BackendMeeting[];
};

// Load the authenticated user's courses and convert backend
// field names into the frontend schedule structure.
export async function getCourses(): Promise<Course[]> {
  const response = await apiFetch("/api/courses");

  if (!response.ok) {
    throw new Error("Failed to load courses");
  }

  const data: BackendCourse[] = await response.json();

  return data.map((course) => ({
    id: course.id,
    name: course.name,

    doctor: course.doctor ?? undefined,
    section: course.section ?? undefined,
    building: course.building ?? undefined,
    room: course.room ?? undefined,

    meetings: course.meetings.map((meeting) => ({
      day: meeting.day,

      // PostgreSQL time values may include seconds, while the
      // frontend schedule uses HH:MM values.
      startTime: meeting.start_time.slice(0, 5),
      endTime: meeting.end_time.slice(0, 5),
    })),
  }));
}

// Create a course and normalize the server response for frontend use.
export async function createCourse(newCourse: NewCourse): Promise<Course> {
  const response = await apiFetch("/api/courses", {
    method: "POST",
    body: JSON.stringify(newCourse),
  });

  if (!response.ok) {
    throw new Error("Failed to create course");
  }

  const course: BackendCourse = await response.json();

  return {
    id: course.id,
    name: course.name,

    doctor: course.doctor ?? undefined,
    section: course.section ?? undefined,
    building: course.building ?? undefined,
    room: course.room ?? undefined,

    meetings: course.meetings.map((meeting) => ({
      day: meeting.day,
      startTime: meeting.start_time.slice(0, 5),
      endTime: meeting.end_time.slice(0, 5),
    })),
  };
}

// Replace a course and its meeting list, then normalize
// the updated server response for local state.
export async function updateCourse(
  courseId: number,
  updatedCourse: NewCourse,
): Promise<Course> {
  const response = await apiFetch(`/api/courses/${courseId}`, {
    method: "PUT",
    body: JSON.stringify(updatedCourse),
  });

  if (!response.ok) {
    throw new Error("Failed to update course");
  }

  const course: BackendCourse = await response.json();

  return {
    id: course.id,
    name: course.name,
    doctor: course.doctor ?? undefined,
    section: course.section ?? undefined,
    building: course.building ?? undefined,
    room: course.room ?? undefined,

    meetings: course.meetings.map((meeting) => ({
      day: meeting.day,
      startTime: meeting.start_time.slice(0, 5),
      endTime: meeting.end_time.slice(0, 5),
    })),
  };
}

// Update one meeting by sending both its original values
// and the replacement values to the backend.
export async function updateCourseMeeting(
  courseId: number,
  originalMeeting: Meeting,
  updatedMeeting: Meeting,
): Promise<Meeting> {
  const response = await apiFetch(`/api/courses/${courseId}/meeting`, {
    method: "PATCH",
    body: JSON.stringify({
      originalMeeting,
      updatedMeeting,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update meeting");
  }

  const meeting: BackendMeeting = await response.json();

  return {
    day: meeting.day,
    startTime: meeting.start_time.slice(0, 5),
    endTime: meeting.end_time.slice(0, 5),
  };
}

// Delete an entire course and its related meetings.
export async function deleteCourse(courseId: number): Promise<void> {
  const response = await apiFetch(`/api/courses/${courseId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete course");
  }
}

// Delete one exact meeting using its day and original time range
// as query parameters.
export async function deleteCourseMeeting(
  courseId: number,
  meeting: Meeting,
): Promise<void> {
  const params = new URLSearchParams({
    day: meeting.day,
    start_time: meeting.startTime,
    end_time: meeting.endTime,
  });

  const response = await apiFetch(
    `/api/courses/${courseId}/meeting?${params.toString()}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete meeting");
  }
}
