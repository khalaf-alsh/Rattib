import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./SchedulePage.css";
import StudySchedule from "../../components/schedule/StudySchedule";
import { usePageTitle } from "../../hooks/usePageTitle";
import DailyPlanner from "../../components/daily/DailyPlanner";

import { getCourses } from "../../services/courseService";
import type { Course } from "../../types/schedule";
type ScheduleTab = "study" | "daily";

function SchedulePage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ScheduleTab>("study");
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesStatus, setCoursesStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadAttempt, setLoadAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    getCourses().then((saved) => {
      if (active) { setCourses(saved); setCoursesStatus("ready"); }
    }).catch(() => { if (active) setCoursesStatus("error"); });
    return () => { active = false; };
  }, [loadAttempt]);
  const retryCourses = () => { setCoursesStatus("loading"); setLoadAttempt((n) => n + 1); };
  usePageTitle("pageTitles.schedule");

  return (
    <div className={`schedule-page ${activeTab === "daily" ? "schedule-page--daily" : "schedule-page--study"}`}>
      <div className="schedule-tabs">
        <button
          type="button"
          className={`schedule-tab ${activeTab === "study" ? "active" : ""}`}
          onClick={() => setActiveTab("study")}
        >
          {t("studySchedule")}
        </button>

        <button
          type="button"
          className={`schedule-tab ${activeTab === "daily" ? "active" : ""}`}
          onClick={() => setActiveTab("daily")}
        >
          {t("dailyPlanner")}
        </button>
      </div>

      <div className="schedule-content">
        {coursesStatus !== "ready" && <div className="schedule-load-state" role={coursesStatus === "error" ? "alert" : "status"}>
          <p>{t(coursesStatus === "loading" ? "scheduleLoading" : "scheduleLoadError")}</p>
          {coursesStatus === "error" && <button type="button" onClick={retryCourses}>{t("retry")}</button>}
        </div>}
        <div className="study-schedule-panel" hidden={activeTab !== "study"}>
          <StudySchedule courses={courses} setCourses={setCourses} coursesReady={coursesStatus === "ready"} />
        </div>
        <div className="daily-planner-panel" hidden={activeTab !== "daily"}><DailyPlanner courses={courses} /></div>
      </div>
    </div>
  );
}

export default SchedulePage;
