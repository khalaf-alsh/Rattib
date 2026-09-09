import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import DailyPlanner from "../../components/daily/DailyPlanner";
import StudySchedule from "../../components/schedule/StudySchedule";
import { usePageTitle } from "../../hooks/usePageTitle";
import { getCourses } from "../../services/courseService";
import type { Course } from "../../types/schedule";

import "./SchedulePage.css";

type ScheduleTab = "study" | "daily";

function SchedulePage() {
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState<Course[]>([]);

  const [coursesStatus, setCoursesStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");

  const [loadAttempt, setLoadAttempt] = useState(0);

  usePageTitle("pageTitles.schedule");

  // The selected tab lives in the URL so refreshes, Account navigation,
  // and notification deep links can restore the exact Schedule section.
  const activeTab: ScheduleTab =
    searchParams.get("tab") === "daily" ? "daily" : "study";

  const changeTab = (tab: ScheduleTab) => {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.set("tab", tab);

    setSearchParams(nextParams, {
      replace: true,
    });
  };

  useEffect(() => {
    let active = true;

    // Ignore late responses after the page unmounts to avoid updating
    // React state from an outdated request.
    getCourses()
      .then((saved) => {
        if (!active) {
          return;
        }

        setCourses(saved);
        setCoursesStatus("ready");
      })
      .catch(() => {
        if (active) {
          setCoursesStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [loadAttempt]);

  const retryCourses = () => {
    setCoursesStatus("loading");
    setLoadAttempt((currentAttempt) => currentAttempt + 1);
  };

  return (
    <div
      className={`schedule-page ${
        activeTab === "daily" ? "schedule-page--daily" : "schedule-page--study"
      }`}
    >
      <div className="schedule-tabs">
        <button
          type="button"
          className={`schedule-tab ${activeTab === "study" ? "active" : ""}`}
          onClick={() => changeTab("study")}
        >
          {t("studySchedule")}
        </button>

        <button
          type="button"
          className={`schedule-tab ${activeTab === "daily" ? "active" : ""}`}
          onClick={() => changeTab("daily")}
        >
          {t("dailyPlanner")}
        </button>
      </div>

      <div className="schedule-content">
        {coursesStatus !== "ready" && (
          <div
            className="schedule-load-state"
            role={coursesStatus === "error" ? "alert" : "status"}
          >
            <p>
              {t(
                coursesStatus === "loading"
                  ? "scheduleLoading"
                  : "scheduleLoadError",
              )}
            </p>

            {coursesStatus === "error" && (
              <button type="button" onClick={retryCourses}>
                {t("retry")}
              </button>
            )}
          </div>
        )}

        <div className="study-schedule-panel" hidden={activeTab !== "study"}>
          <StudySchedule
            courses={courses}
            setCourses={setCourses}
            coursesReady={coursesStatus === "ready"}
          />
        </div>

        <div className="daily-planner-panel" hidden={activeTab !== "daily"}>
          <DailyPlanner courses={courses} />
        </div>
      </div>
    </div>
  );
}

export default SchedulePage;
