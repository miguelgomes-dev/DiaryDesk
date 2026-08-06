import { GraduationCap } from "lucide-react";
import { SectionTitle } from "@/components/ui/section-title";
import { EmptyState } from "@/components/ui/empty-state";

export default function FaculdadePage() {
  return (
    <div className="flex flex-col gap-6">
      <SectionTitle icon={GraduationCap} color="var(--thread-faculdade)">
        Faculdade
      </SectionTitle>
      <EmptyState
        icon={GraduationCap}
        title="Nenhuma disciplina cadastrada"
        description="Notas e médias entram aqui, com o cálculo da nota mínima pronto na hora."
      />
    </div>
  );
}
