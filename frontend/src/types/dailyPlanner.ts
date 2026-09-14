export type TaskReminder =
  | "none"
  | "atTime"
  | "10Minutes"
  | "15Minutes"
  | "30Minutes"
  | "1Hour"
  | "customTime";

export type TaskSeriesType = "single" | "daily" | "weekly" | "customDates";

export type DailyTask = {
  id: number;
  title: string;
  date: string;

  startTime?: string;
  endTime?: string;

  notes?: string;

  reminder?: TaskReminder;

  reminderTime?: string;

  timeZone?: string;

  completed: boolean;

  seriesId?: string;
  seriesType: TaskSeriesType;
};

export type DailyTaskInput = {
  title: string;
  date: string;

  startTime?: string;
  endTime?: string;

  notes?: string;

  reminder?: TaskReminder;
  reminderTime?: string;
  timeZone?: string;

  seriesType: TaskSeriesType;

  repeatUntil?: string;
  customDates?: string[];
};
