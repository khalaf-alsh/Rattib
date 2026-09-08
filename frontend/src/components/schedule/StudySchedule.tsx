import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import Toast from "../ui/Toast";
import { useTranslation } from "react-i18next";
import CourseCard from "./CourseCard";
import CourseModal from "./CourseModal";
import EditScopeModal from "./EditScopeModal";
import DeleteScheduleModal from "./DeleteScheduleModal";
import DeleteScopeModal from "./DeleteScopeModal";
import {
  createCourse,
  deleteCourse,
  deleteCourseMeeting,
  updateCourse,
  updateCourseMeeting,
} from "../../services/courseService";
import type { Course, Day, Meeting, NewCourse } from "../../types/schedule";
import "./StudySchedule.css";

const days: Day[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

type ScheduleView = "day" | "week";

type CourseModalState =
  | {
      mode: "add";
    }
  | {
      mode: "edit-course";
      course: Course;
    }
  | {
      mode: "edit-meeting";
      course: Course;
      meeting: Meeting;
    }
  | null;

type EditChoiceState = {
  course: Course;
  meeting: Meeting;
} | null;

type StudyScheduleProps = { courses: Course[]; setCourses: Dispatch<SetStateAction<Course[]>>; coursesReady: boolean };
function StudySchedule({ courses, setCourses, coursesReady }: StudyScheduleProps) {
  const { t, i18n } = useTranslation();

  const [selectedDay, setSelectedDay] = useState<Day>(() => {
    const todayIndex = new Date().getDay();

    return days[todayIndex];
  });

  const [scheduleView, setScheduleView] = useState<ScheduleView>("day");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toastMessage]);

  const [courseModalState, setCourseModalState] =
    useState<CourseModalState>(null);

  const [editChoice, setEditChoice] = useState<EditChoiceState>(null);

  const [deleteChoice, setDeleteChoice] = useState<EditChoiceState>(null);

  const [deleteScheduleOpen, setDeleteScheduleOpen] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState(false);
  const [deleteScheduleError, setDeleteScheduleError] = useState(false);
  const deletingScheduleRef = useRef(false);

  const handleDeleteSchedule = async () => {
    if (deletingScheduleRef.current || !coursesReady || courses.length === 0) return;
    deletingScheduleRef.current = true;
    setDeletingSchedule(true);
    setDeleteScheduleError(false);
    try {
      // Remove only confirmed deletions from the shared state.
      for (const course of courses) {
        await deleteCourse(course.id);
        setCourses((current) => current.filter((item) => item.id !== course.id));
      }
      setDeleteScheduleOpen(false);
      setToastMessage(t("deleteSchedule.success"));
    } catch {
      // Keep failed and unattempted courses available for a retry.
      setDeleteScheduleError(true);
    } finally {
      deletingScheduleRef.current = false;
      setDeletingSchedule(false);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    try {
      await deleteCourse(courseId);

      setCourses((currentCourses) =>
        currentCourses.filter((course) => course.id !== courseId),
      );

      setDeleteChoice(null);
      setToastMessage(t("courseDeleted"));
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  const handleDeleteMeeting = async (
    courseId: number,
    meetingToDelete: Meeting,
  ) => {
    try {
      await deleteCourseMeeting(courseId, meetingToDelete);

      setCourses((currentCourses) =>
        currentCourses
          .map((course) => {
            if (course.id !== courseId) {
              return course;
            }

            return {
              ...course,
              meetings: course.meetings.filter(
                (meeting) => !sameMeeting(meeting, meetingToDelete),
              ),
            };
          })
          .filter((course) => course.meetings.length > 0),
      );

      setDeleteChoice(null);
      setToastMessage(t("meetingDeleted"));
    } catch (error) {
      console.error("Failed to delete meeting:", error);
    }
  };

  const getCoursesForDay = (day: Day) => {
    return courses
      .flatMap((course) =>
        course.meetings
          .filter((meeting) => meeting.day === day)
          .map((meeting) => ({
            course,
            meeting,
          })),
      )
      .sort((a, b) => a.meeting.startTime.localeCompare(b.meeting.startTime));
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);

    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return new Intl.DateTimeFormat(i18n.language === "ar" ? "ar-SA" : "en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const handleAddCourse = async (newCourse: NewCourse) => {
    try {
      const savedCourse = await createCourse(newCourse);

      setCourses((currentCourses) => [...currentCourses, savedCourse]);

      setToastMessage(t("courseAdded"));
    } catch (error) {
      console.error("Failed to add course:", error);
    }
  };
  const handleUpdateCourse = async (
    courseId: number,
    updatedCourse: NewCourse,
  ) => {
    try {
      const savedCourse = await updateCourse(courseId, updatedCourse);

      setCourses((currentCourses) =>
        currentCourses.map((course) =>
          course.id === courseId ? savedCourse : course,
        ),
      );

      setToastMessage(t("courseUpdated"));
    } catch (error) {
      console.error("Failed to update course:", error);
    }
  };

  const sameMeeting = (first: Meeting, second: Meeting) => {
    return (
      first.day === second.day &&
      first.startTime === second.startTime &&
      first.endTime === second.endTime
    );
  };

  const handleUpdateMeeting = async (
    courseId: number,
    originalMeeting: Meeting,
    updatedCourse: NewCourse,
  ) => {
    const updatedMeeting = updatedCourse.meetings[0];

    if (!updatedMeeting) {
      return;
    }

    try {
      const savedMeeting = await updateCourseMeeting(
        courseId,
        originalMeeting,
        updatedMeeting,
      );

      setCourses((currentCourses) =>
        currentCourses.map((course) => {
          if (course.id !== courseId) {
            return course;
          }

          let replaced = false;

          const meetings = course.meetings.map((meeting) => {
            if (!replaced && sameMeeting(meeting, originalMeeting)) {
              replaced = true;

              return savedMeeting;
            }

            return meeting;
          });

          return {
            ...course,
            meetings,
          };
        }),
      );

      setToastMessage(t("meetingUpdated"));
    } catch (error) {
      console.error("Failed to update meeting:", error);
    }
  };

  const requestEdit = (course: Course, meeting: Meeting) => {
    if (course.meetings.length > 1) {
      setEditChoice({
        course,
        meeting,
      });

      return;
    }

    setCourseModalState({
      mode: "edit-course",
      course,
    });
  };

  const selectedDayCourses = getCoursesForDay(selectedDay);

  const handleModalSave = (updatedCourse: NewCourse) => {
    if (!courseModalState) {
      return;
    }

    if (courseModalState.mode === "add") {
      handleAddCourse(updatedCourse);

      return;
    }

    if (courseModalState.mode === "edit-course") {
      handleUpdateCourse(courseModalState.course.id, updatedCourse);

      return;
    }

    handleUpdateMeeting(
      courseModalState.course.id,
      courseModalState.meeting,
      updatedCourse,
    );
  };

  return (
    <div className="study-schedule">
      <div className="schedule-view-toggle">
        <button
          type="button"
          className={`view-toggle-button ${
            scheduleView === "day" ? "active" : ""
          }`}
          onClick={() => setScheduleView("day")}
        >
          {t("dayView")}
        </button>

        <button
          type="button"
          className={`view-toggle-button ${
            scheduleView === "week" ? "active" : ""
          }`}
          onClick={() => setScheduleView("week")}
        >
          {t("weekView")}
        </button>
      </div>

      {!coursesReady ? null : scheduleView === "day" ? (
        <>
          <div className="week-days">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                className={`day-button ${selectedDay === day ? "active" : ""}`}
                onClick={() => setSelectedDay(day)}
              >
                {t(`days.${day}`)}
              </button>
            ))}
          </div>

          <div className="classes-area">
            {selectedDayCourses.length === 0 ? (
              <div className="empty-classes">
                <p>{t("noClasses")}</p>
              </div>
            ) : (
              <div className="classes-list">
                {selectedDayCourses.map(({ course, meeting }) => (
                  <CourseCard
                    key={`${course.id}-${meeting.day}-${meeting.startTime}`}
                    name={course.name}
                    startTime={meeting.startTime}
                    endTime={meeting.endTime}
                    doctor={course.doctor}
                    building={course.building}
                    room={course.room}
                    section={course.section}
                    onEdit={() => requestEdit(course, meeting)}
                    onDelete={() =>
                      setDeleteChoice({
                        course,
                        meeting,
                      })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="week-view">
          {days.map((day, index) => {
            const dayCourses = getCoursesForDay(day);

            return (
              <div
                key={day}
                className={`week-day-column ${
                  index % 2 === 0 ? "week-color-a" : "week-color-b"
                } ${
                  (day === "friday" || day === "saturday") &&
                  dayCourses.length === 0
                    ? "optional-empty-day"
                    : ""
                }`}
              >
                <div className="week-day-title">
                  <span className="week-day-full">{t(`days.${day}`)}</span>

                  <span className="week-day-short">
                    {t(`daysShort.${day}`)}
                  </span>
                </div>

                <div className="week-day-classes">
                  {dayCourses.length === 0 ? (
                    <div className="week-empty-day">{t("noClasses")}</div>
                  ) : (
                    dayCourses.map(({ course, meeting }) => (
                      <div
                        key={`${course.id}-${day}-${meeting.startTime}`}
                        className="week-course-card"
                      >
                        <strong className="week-course-name">
                          {course.name}
                        </strong>

                        <span className="week-course-time">
                          <span>{formatTime(meeting.startTime)}</span>

                          <span className="week-time-separator">–</span>

                          <span>{formatTime(meeting.endTime)}</span>
                        </span>

                        {course.room && (
                          <span className="week-course-room">
                            <span className="week-room-full-label">
                              {t("room")}:
                            </span>
                            <span className="week-room-short-label">
                              {t("roomShort")}
                            </span>{" "}
                            {course.room}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="schedule-actions schedule-actions-with-delete">
        <button
          className="add-course-button" disabled={!coursesReady}
          type="button"
          onClick={() =>
            setCourseModalState({
              mode: "add",
            })
          }
        >
          <Plus size={20} />

          <span>{t("addCourseForDay")}</span>
        </button>
        <button
          type="button"
          className="delete-entire-schedule-button"
          disabled={!coursesReady || courses.length === 0 || deletingSchedule}
          onClick={() => {
            setDeleteScheduleError(false);
            setDeleteScheduleOpen(true);
          }}
        >
          <Trash2 size={18} />
          {t("deleteSchedule.title")}
        </button>
      </div>

      {deleteScheduleOpen && (
        <DeleteScheduleModal
          deleting={deletingSchedule}
          error={deleteScheduleError}
          onConfirm={handleDeleteSchedule}
          onClose={() => {
            if (!deletingScheduleRef.current) setDeleteScheduleOpen(false);
          }}
        />
      )}

      {editChoice && (
        <EditScopeModal
          course={editChoice.course}
          meeting={editChoice.meeting}
          onClose={() => setEditChoice(null)}
          onEditMeeting={() => {
            setCourseModalState({
              mode: "edit-meeting",
              course: editChoice.course,
              meeting: editChoice.meeting,
            });

            setEditChoice(null);
          }}
          onEditCourse={() => {
            setCourseModalState({
              mode: "edit-course",
              course: editChoice.course,
            });

            setEditChoice(null);
          }}
        />
      )}

      {deleteChoice && (
        <DeleteScopeModal
          course={deleteChoice.course}
          meeting={deleteChoice.meeting}
          onClose={() => setDeleteChoice(null)}
          onDeleteMeeting={() =>
            handleDeleteMeeting(deleteChoice.course.id, deleteChoice.meeting)
          }
          onDeleteCourse={() => handleDeleteCourse(deleteChoice.course.id)}
        />
      )}

      {courseModalState && (
        <CourseModal
          courses={courses}
          mode={courseModalState.mode}
          initialCourse={
            courseModalState.mode === "add"
              ? undefined
              : courseModalState.course
          }
          initialMeeting={
            courseModalState.mode === "edit-meeting"
              ? courseModalState.meeting
              : undefined
          }
          onClose={() => setCourseModalState(null)}
          onSave={handleModalSave}
        />
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}

export default StudySchedule;
