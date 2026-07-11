import { Card } from "@/components/ui/card";

export default function FaculdadePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl italic">Faculdade</h1>
      <Card ribbon="var(--thread-faculdade)" className="flex flex-col gap-1.5">
        <p className="text-sm font-medium">Nenhuma disciplina cadastrada.</p>
        <p className="text-sm text-foreground/70">
          Notas e médias entram aqui, com o cálculo da nota mínima pronto na
          hora.
        </p>
      </Card>
    </div>
  );
}
