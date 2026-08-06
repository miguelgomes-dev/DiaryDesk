import { GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function FaculdadePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-[650] tracking-[-0.033em]">Faculdade</h1>
      <EmptyState
        icon={GraduationCap}
        title="Nenhuma disciplina cadastrada"
        description="Notas e médias entram aqui, com o cálculo da nota mínima pronto na hora."
      />
    </div>
  );
}
