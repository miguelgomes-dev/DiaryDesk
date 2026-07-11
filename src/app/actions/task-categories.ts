"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

export async function createTaskCategory(formData: FormData) {
  const user = await verifySession();
  const supabase = await createClient();

  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    throw new Error("Nome é obrigatório");
  }
  const color = (formData.get("color") as string) || "#6b7280";

  const { error } = await supabase
    .from("task_categories")
    .insert({ user_id: user.id, name, color });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tarefas");
}

export async function renameTaskCategory(formData: FormData) {
  await verifySession();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    throw new Error("Nome é obrigatório");
  }
  const color = (formData.get("color") as string) || "#6b7280";

  const { error } = await supabase
    .from("task_categories")
    .update({ name, color })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tarefas");
}

export async function deleteTaskCategory(formData: FormData) {
  await verifySession();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const { error } = await supabase
    .from("task_categories")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tarefas");
}
