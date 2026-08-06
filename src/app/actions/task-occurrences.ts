"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { utcIsoToZonedIso } from "@/lib/timezone";

export type TaskOccurrence = {
  taskId: string;
  occurrenceDate: string;
  title: string;
  status: "done" | "skipped" | null;
};

type RecurringTaskRow = {
  id: string;
  title: string;
  start_at: string;
  recurrence_frequency: "daily" | "weekly" | "monthly";
  recurrence_interval: number;
  recurrence_days_of_week: number[] | null;
  recurrence_end_date: string | null;
};

const MS_PER_DAY = 86_400_000;

function toDayNumber(dateStr: string) {
  const [year, month, day] = dateStr.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

function fromDayNumber(day: number) {
  return new Date(day * MS_PER_DAY).toISOString().slice(0, 10);
}

function dayOfWeek(day: number) {
  return new Date(day * MS_PER_DAY).getUTCDay();
}

// Expands a recurrence rule into the individual dates it lands on within
// [rangeStartDay, rangeEndDay]. Lives in the app (not SQL) because a fixed
// N-week generate_series step can only ever revisit the start date's own
// weekday — it can't combine multiple weekdays in one weekly rule, which
// the task form allows.
function expandTask(
  task: RecurringTaskRow,
  rangeStartDay: number,
  rangeEndDay: number,
): number[] {
  const startDay = toDayNumber(task.start_at);
  const endBoundDay = task.recurrence_end_date
    ? Math.min(toDayNumber(task.recurrence_end_date), rangeEndDay)
    : rangeEndDay;
  const firstDay = Math.max(startDay, rangeStartDay);
  if (firstDay > endBoundDay) return [];

  const startDate = new Date(startDay * MS_PER_DAY);
  const days: number[] = [];

  for (let day = firstDay; day <= endBoundDay; day++) {
    let matches = false;

    if (task.recurrence_frequency === "daily") {
      matches = (day - startDay) % task.recurrence_interval === 0;
    } else if (task.recurrence_frequency === "weekly") {
      const weekAnchor = startDay - dayOfWeek(startDay);
      const dayWeekAnchor = day - dayOfWeek(day);
      const weeksSince = (dayWeekAnchor - weekAnchor) / 7;
      matches =
        (task.recurrence_days_of_week ?? []).includes(dayOfWeek(day)) &&
        weeksSince >= 0 &&
        weeksSince % task.recurrence_interval === 0;
    } else if (task.recurrence_frequency === "monthly") {
      const date = new Date(day * MS_PER_DAY);
      const monthsSince =
        (date.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
        (date.getUTCMonth() - startDate.getUTCMonth());
      matches =
        date.getUTCDate() === startDate.getUTCDate() &&
        monthsSince >= 0 &&
        monthsSince % task.recurrence_interval === 0;
    }

    if (matches) days.push(day);
  }

  return days;
}

export async function getTaskOccurrences(
  rangeStart: string,
  rangeEnd: string,
): Promise<TaskOccurrence[]> {
  const user = await verifySession();
  const supabase = await createClient();

  const [{ data: recurringTasks, error: tasksError }, { data: completions }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select(
          "id, title, start_at, recurrence_frequency, recurrence_interval, recurrence_days_of_week, recurrence_end_date",
        )
        .eq("user_id", user.id)
        .neq("recurrence_frequency", "none"),
      supabase
        .from("task_completions")
        .select("task_id, occurrence_date, status")
        .gte("occurrence_date", rangeStart)
        .lte("occurrence_date", rangeEnd),
    ]);

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  // start_at vem do banco como instante UTC; a recorrência abaixo é
  // pensada em dias de calendário de Brasília (ex: "toda sexta"), então
  // precisa do dia local antes de entrar na aritmética em UTC.
  const zonedRecurringTasks = (recurringTasks ?? []).map((task) => ({
    ...task,
    start_at: utcIsoToZonedIso(task.start_at),
  })) as RecurringTaskRow[];

  const statusByKey = new Map(
    (completions ?? []).map((completion) => [
      `${completion.task_id}:${completion.occurrence_date}`,
      completion.status as "done" | "skipped",
    ]),
  );

  const rangeStartDay = toDayNumber(rangeStart);
  const rangeEndDay = toDayNumber(rangeEnd);

  const occurrences: TaskOccurrence[] = [];
  for (const task of zonedRecurringTasks) {
    for (const day of expandTask(task, rangeStartDay, rangeEndDay)) {
      const occurrenceDate = fromDayNumber(day);
      occurrences.push({
        taskId: task.id,
        occurrenceDate,
        title: task.title,
        status: statusByKey.get(`${task.id}:${occurrenceDate}`) ?? null,
      });
    }
  }

  return occurrences;
}

export async function setOccurrenceStatus(formData: FormData) {
  await verifySession();
  const supabase = await createClient();

  const taskId = formData.get("taskId") as string;
  const occurrenceDate = formData.get("occurrenceDate") as string;
  const status = formData.get("status") as "done" | "skipped";

  const { error } = await supabase.from("task_completions").upsert(
    { task_id: taskId, occurrence_date: occurrenceDate, status },
    { onConflict: "task_id,occurrence_date" },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tarefas");
}

export async function clearOccurrenceStatus(formData: FormData) {
  await verifySession();
  const supabase = await createClient();

  const taskId = formData.get("taskId") as string;
  const occurrenceDate = formData.get("occurrenceDate") as string;

  const { error } = await supabase
    .from("task_completions")
    .delete()
    .eq("task_id", taskId)
    .eq("occurrence_date", occurrenceDate);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tarefas");
}
