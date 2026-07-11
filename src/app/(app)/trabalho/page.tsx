import { Card } from "@/components/ui/card";

export default function TrabalhoPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl italic">Trabalho</h1>
      <Card ribbon="var(--thread-trabalho)" className="flex flex-col gap-1.5">
        <p className="text-sm font-medium">Nenhum projeto no quadro.</p>
        <p className="text-sm text-foreground/70">
          Um kanban simples para acompanhar o que está em andamento no
          trabalho.
        </p>
      </Card>
    </div>
  );
}
