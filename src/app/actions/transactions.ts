"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

function readTransactionFields(formData: FormData) {
  const type = formData.get("type") as string;
  if (type !== "income" && type !== "expense") {
    throw new Error("Tipo é obrigatório");
  }

  const amount = parseFloat((formData.get("amount") as string) || "");
  if (!amount || amount <= 0) {
    throw new Error("Valor deve ser maior que zero");
  }

  const occurredOn = formData.get("occurredOn") as string;
  if (!occurredOn) {
    throw new Error("Data é obrigatória");
  }

  const categoryId = (formData.get("categoryId") as string) || null;
  const description = (formData.get("description") as string)?.trim() || null;

  return {
    type,
    amount,
    occurred_on: occurredOn,
    category_id: categoryId,
    description,
  };
}

export async function createTransaction(formData: FormData) {
  const user = await verifySession();
  const supabase = await createClient();

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    ...readTransactionFields(formData),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/financeiro");
}

export async function updateTransaction(formData: FormData) {
  await verifySession();
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("transactions")
    .update(readTransactionFields(formData))
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/financeiro");
}

export async function deleteTransaction(formData: FormData) {
  await verifySession();
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/financeiro");
}
