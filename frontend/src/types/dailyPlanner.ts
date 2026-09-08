export type TaskReminder =
  | "none"
  | "atTime"
  | "10Minutes"
  | "15Minutes"
  | "30Minutes"
  | "1Hour";

export type DailyTask = {
  id: number;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  reminder?: TaskReminder;
  completed: boolean;
};
