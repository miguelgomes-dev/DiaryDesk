import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { utcIsoToZonedIso } from "@/lib/timezone";
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
        .eq("user_id", user.id)
        .in("source_type", ["faculdade", "trabalho"]),
    ]);

  // start_at vem do banco como instante UTC (timestamptz); convertido aqui,
  // uma única vez, para hora de parede de Brasília. Componentes client-side
  // recebem só a string "ingênua" resultante e nunca precisam saber que o
  // banco guarda UTC — evita depender do fuso do navegador de quem vê a tela.
  const allTasks = (tasks ?? []).map((task) => ({
    ...task,
    start_at: utcIsoToZonedIso(task.start_at),
  })) as Task[];
  const singleTasks = allTasks.filter(
    (task) => task.recurrence_frequency === "none",
  );
  const recurringTasks = allTasks.filter(
    (task) => task.recurrence_frequency !== "none",
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-[650] tracking-[-0.033em]">Tarefas</h1>
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
