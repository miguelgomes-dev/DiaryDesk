import { Briefcase } from "lucide-react";
import { SectionTitle } from "@/components/ui/section-title";
import { EmptyState } from "@/components/ui/empty-state";

export default function TrabalhoPage() {
  return (
    <div className="flex flex-col gap-6">
      <SectionTitle icon={Briefcase} color="var(--thread-trabalho)">
        Trabalho
      </SectionTitle>
      <EmptyState
        icon={Briefcase}
        title="Nenhum projeto no quadro"
        description="Um kanban simples para acompanhar o que está em andamento no trabalho."
      />
    </div>
  );
}
