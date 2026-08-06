"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

export async function createTransactionCategory(formData: FormData) {
  const user = await verifySession();
  const supabase = await createClient();

  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    throw new Error("Nome é obrigatório");
  }
  const type = formData.get("type") as string;
  if (type !== "income" && type !== "expense") {
    throw new Error("Tipo é obrigatório");
  }
  const color = (formData.get("color") as string) || "#6b7280";

  const { error } = await supabase
    .from("transaction_categories")
    .insert({ user_id: user.id, name, type, color });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/configuracoes");
  revalidatePath("/financeiro");
}

export async function renameTransactionCategory(formData: FormData) {
  await verifySession();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    throw new Error("Nome é obrigatório");
  }
  const type = formData.get("type") as string;
  if (type !== "income" && type !== "expense") {
    throw new Error("Tipo é obrigatório");
  }
  const color = (formData.get("color") as string) || "#6b7280";

  const { error } = await supabase
    .from("transaction_categories")
    .update({ name, type, color })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/configuracoes");
  revalidatePath("/financeiro");
}

export async function deleteTransactionCategory(formData: FormData) {
  await verifySession();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const { error } = await supabase
    .from("transaction_categories")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/configuracoes");
  revalidatePath("/financeiro");
}
