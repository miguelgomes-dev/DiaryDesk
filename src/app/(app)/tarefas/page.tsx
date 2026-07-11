import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { CategoryManager } from "@/components/tarefas/category-manager";
import { TasksCalendar } from "@/components/tarefas/tasks-calendar";

export default async function TarefasPage() {
  const user = await verifySession();
  const supabase = await createClient();

  const [{ data: categories }, { data: tasks }] = await Promise.all([
    supabase
      .from("task_categories")
      .select("id, name, color")
      .eq("user_id", user.id)
      .order("name"),
    supabase
      .from("tasks")
      .select(
        "id, title, description, start_at, all_day, category_id, completed_at",
      )
      .eq("user_id", user.id)
      .eq("recurrence_frequency", "none"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl italic">Tarefas</h1>
      <CategoryManager categories={categories ?? []} />
      <TasksCalendar tasks={tasks ?? []} categories={categories ?? []} />
    </div>
  );
}
