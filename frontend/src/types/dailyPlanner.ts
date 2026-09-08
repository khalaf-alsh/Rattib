export type TaskReminder =
  | "none"
  | "atTime"
  | "10Minutes"
  | "15Minutes"
  | "30Minutes"
  | "1Hour"
  | "customTime";

export type DailyTask = {
  id: number;
  title: string;
  date: string;

  startTime?: string;
  endTime?: string;

  notes?: string;

  reminder?: TaskReminder;

  // يستخدم للمهام التي لا تحتوي Start Time
  reminderTime?: string;

  // مثال: Asia/Riyadh
  timeZone?: string;

  completed: boolean;
};
