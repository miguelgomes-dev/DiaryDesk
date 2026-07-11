"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

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

  return {
    title,
    description,
    start_at: startAt.toISOString(),
    all_day: allDay,
    category_id: categoryId,
    completed_at: completed ? new Date().toISOString() : null,
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
