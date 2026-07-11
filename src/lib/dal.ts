import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_TASK_CATEGORIES = [
  { name: "Trabalho", color: "#2563eb" },
  { name: "Faculdade", color: "#7c3aed" },
  { name: "Amor", color: "#db2777" },
  { name: "Saúde", color: "#16a34a" },
  { name: "Casa", color: "#d97706" },
];

export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.from("profiles").insert({
      id: user.id,
      display_name:
        (user.user_metadata?.display_name as string | undefined) ??
        user.email ??
        "Usuário",
    });

    await supabase.from("task_categories").insert(
      DEFAULT_TASK_CATEGORIES.map((category) => ({
        user_id: user.id,
        ...category,
      })),
    );
  }

  return user;
});

export const verifySession = cache(async () => {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
});
