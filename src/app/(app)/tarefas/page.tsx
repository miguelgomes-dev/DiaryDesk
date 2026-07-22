import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { CategoryManager } from "@/components/tarefas/category-manager";
import { TasksCalendar } from "@/components/tarefas/tasks-calendar";
import type { Task } from "@/components/tarefas/task-dialog";

export default async function TarefasPage() {
  const user = await verifySession();
  const supabase = await createClient();

  const [{ data: categories }, { data: tasks }, { data: otherEvents }] =
    await Promise.all([
      supabase
        .from("task_categories")
        .select("id, name, color")
        .eq("user_id", user.id)
        .order("name"),
      supabase
        .from("tasks")
        .select(
          "id, title, description, start_at, all_day, category_id, completed_at, recurrence_frequency, recurrence_interval, recurrence_days_of_week, recurrence_end_date",
        )
        .eq("user_id", user.id),
      supabase
        .from("calendar_events")
        .select("source_id, title, start_at, all_day, source_type")
        .in("source_type", ["faculdade", "trabalho"]),
    ]);

  const allTasks = (tasks ?? []) as Task[];
  const singleTasks = allTasks.filter(
    (task) => task.recurrence_frequency === "none",
  );
  const recurringTasks = allTasks.filter(
    (task) => task.recurrence_frequency !== "none",
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl italic">Tarefas</h1>
      <CategoryManager categories={categories ?? []} />
      <TasksCalendar
        singleTasks={singleTasks}
        recurringTasks={recurringTasks}
        otherEvents={otherEvents ?? []}
        categories={categories ?? []}
      />
    </div>
  );
}
