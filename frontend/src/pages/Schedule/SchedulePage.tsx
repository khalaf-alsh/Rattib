import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./SchedulePage.css";
import StudySchedule from "../../components/schedule/StudySchedule";
import { usePageTitle } from "../../hooks/usePageTitle";
import DailyPlanner from "../../components/daily/DailyPlanner";

type ScheduleTab = "study" | "daily";

function SchedulePage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ScheduleTab>("study");
  usePageTitle("pageTitles.schedule");

  return (
    <div className="schedule-page">
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
        {activeTab === "study" ? <StudySchedule /> : <DailyPlanner />}
      </div>
    </div>
  );
}

export default SchedulePage;
