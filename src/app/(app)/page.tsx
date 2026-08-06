import { CalendarCheck } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardPage() {
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-foreground/50">
          {today}
        </span>
        <h1 className="text-3xl font-[650] tracking-[-0.033em]">Dashboard</h1>
      </div>
      <EmptyState
        icon={CalendarCheck}
        title="Nenhum compromisso lançado ainda"
        description="Quando tarefas, aulas e prazos de trabalho entrarem no calendário unificado, o dia de hoje aparece resumido aqui."
      />
    </div>
  );
}
