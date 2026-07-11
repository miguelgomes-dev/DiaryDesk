import { Card } from "@/components/ui/card";

export default function SaudePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl italic">Saúde</h1>
      <Card ribbon="var(--thread-saude)" className="flex flex-col gap-1.5">
        <p className="text-sm font-medium">Nenhum registro de saúde ainda.</p>
        <p className="text-sm text-foreground/70">
          Peso, exames e consultas ficam guardados aqui, só para você.
        </p>
      </Card>
    </div>
  );
}
