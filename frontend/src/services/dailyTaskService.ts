import { apiFetch } from "../lib/apiClient";

import type { DailyTask, DailyTaskInput } from "../types/dailyPlanner";

type BackendDailyTask = {
  id: number;
  title: string;

  task_date: string;

  start_time: string | null;
  end_time: string | null;

  notes: string | null;

  reminder: DailyTask["reminder"];
  reminder_time: string | null;
  reminder_at: string | null;
  time_zone: string | null;

  completed: boolean;
  series_id: string | null;
  series_type: DailyTask["seriesType"];
};

function mapDailyTask(task: BackendDailyTask): DailyTask {
  return {
    id: task.id,
    title: task.title,
    date: task.task_date,

    startTime: task.start_time ? task.start_time.slice(0, 5) : undefined,

    endTime: task.end_time ? task.end_time.slice(0, 5) : undefined,

    notes: task.notes ?? undefined,

    reminder: task.reminder ?? "none",

    reminderTime: task.reminder_time
      ? task.reminder_time.slice(0, 5)
      : undefined,

    timeZone: task.time_zone ?? undefined,

    seriesId: task.series_id ?? undefined,
    seriesType: task.series_type ?? "single",
    completed: task.completed,
  };
}

export async function getDailyTasks(): Promise<DailyTask[]> {
  const response = await apiFetch("/api/daily-tasks");

  if (!response.ok) {
    throw new Error("Failed to load daily tasks");
  }

  const data: BackendDailyTask[] = await response.json();

  return data.map(mapDailyTask);
}

export async function createDailyTask(
  task: DailyTaskInput,
): Promise<DailyTask> {
  const response = await apiFetch("/api/daily-tasks", {
    method: "POST",
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error("Failed to create daily task");
  }

  const data: BackendDailyTask = await response.json();

  return mapDailyTask(data);
}

export async function updateDailyTask(
  taskId: number,
  task: DailyTaskInput,
): Promise<DailyTask> {
  const response = await apiFetch(`/api/daily-tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error("Failed to update daily task");
  }

  const data: BackendDailyTask = await response.json();

  return mapDailyTask(data);
}

export async function updateDailyTaskCompletion(
  taskId: number,
  completed: boolean,
): Promise<DailyTask> {
  const response = await apiFetch(`/api/daily-tasks/${taskId}/completion`, {
    method: "PATCH",
    body: JSON.stringify({
      completed,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update task completion");
  }

  const data: BackendDailyTask = await response.json();

  return mapDailyTask(data);
}

export type DailyTaskDeleteScope = "single" | "series";

export async function deleteDailyTask(
  taskId: number,
  scope: DailyTaskDeleteScope = "single",
): Promise<void> {
  const response = await apiFetch(`/api/daily-tasks/${taskId}?scope=${scope}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete daily task");
  }
}
