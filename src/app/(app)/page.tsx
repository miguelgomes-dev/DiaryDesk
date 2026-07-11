import { Card } from "@/components/ui/card";

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
        <h1 className="font-serif text-3xl italic">Dashboard</h1>
      </div>
      <Card ribbon="var(--accent)" className="flex flex-col gap-1.5">
        <p className="text-sm font-medium">Nenhum compromisso lançado ainda.</p>
        <p className="text-sm text-foreground/70">
          Quando tarefas, aulas e prazos de trabalho entrarem no calendário
          unificado, o dia de hoje aparece resumido aqui.
        </p>
      </Card>
    </div>
  );
}
