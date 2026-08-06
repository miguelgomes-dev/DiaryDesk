import { CalendarCheck, LayoutGrid } from "lucide-react";
import { SectionTitle } from "@/components/ui/section-title";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardPage() {
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date());

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle
        icon={LayoutGrid}
        color="var(--foreground)"
        eyebrow={
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-foreground/50">
            {today}
          </span>
        }
      >
        Dashboard
      </SectionTitle>
      <EmptyState
        icon={CalendarCheck}
        title="Nenhum compromisso lançado ainda"
        description="Quando tarefas, aulas e prazos de trabalho entrarem no calendário unificado, o dia de hoje aparece resumido aqui."
      />
    </div>
  );
}
