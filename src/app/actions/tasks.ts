"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

const RECURRENCE_FREQUENCIES = ["none", "daily", "weekly", "monthly"] as const;
type RecurrenceFrequency = (typeof RECURRENCE_FREQUENCIES)[number];

function readTaskFields(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  if (!title) {
    throw new Error("Título é obrigatório");
  }

  const date = formData.get("date") as string;
  if (!date) {
    throw new Error("Data é obrigatória");
  }

  const time = (formData.get("time") as string) || "";
  const allDay = time === "";
  const startAt = new Date(allDay ? `${date}T00:00:00` : `${date}T${time}:00`);

  const categoryId = (formData.get("categoryId") as string) || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const completed = formData.get("completed") === "on";

  const recurrenceFrequencyRaw = (formData.get("recurrenceFrequency") as string) || "none";
  const recurrenceFrequency: RecurrenceFrequency = RECURRENCE_FREQUENCIES.includes(
    recurrenceFrequencyRaw as RecurrenceFrequency,
  )
    ? (recurrenceFrequencyRaw as RecurrenceFrequency)
    : "none";

  const recurrenceInterval = Math.max(
    1,
    parseInt((formData.get("recurrenceInterval") as string) || "1", 10) || 1,
  );

  const recurrenceDaysOfWeek = formData
    .getAll("recurrenceDaysOfWeek")
    .map((value) => parseInt(value as string, 10))
    .filter((value) => !Number.isNaN(value));

  if (recurrenceFrequency === "weekly" && recurrenceDaysOfWeek.length === 0) {
    throw new Error("Selecione ao menos um dia da semana para a recorrência");
  }

  const recurrenceEndDateRaw = (formData.get("recurrenceEndDate") as string) || "";
  const recurrenceEndDate = recurrenceEndDateRaw || null;

  return {
    title,
    description,
    start_at: startAt.toISOString(),
    all_day: allDay,
    category_id: categoryId,
    completed_at: recurrenceFrequency === "none" && completed ? new Date().toISOString() : null,
    recurrence_frequency: recurrenceFrequency,
    recurrence_interval: recurrenceInterval,
    recurrence_days_of_week: recurrenceFrequency === "weekly" ? recurrenceDaysOfWeek : null,
    recurrence_end_date: recurrenceFrequency === "none" ? null : recurrenceEndDate,
  };
}

export async function createTask(formData: FormData) {
  const user = await verifySession();
  const supabase = await createClient();

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    ...readTaskFields(formData),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tarefas");
}

export async function updateTask(formData: FormData) {
  await verifySession();
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("tasks")
    .update(readTaskFields(formData))
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tarefas");
}

export async function deleteTask(formData: FormData) {
  await verifySession();
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tarefas");
}
