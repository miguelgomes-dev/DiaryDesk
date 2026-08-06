import { Briefcase } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function TrabalhoPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-[650] tracking-[-0.033em]">Trabalho</h1>
      <EmptyState
        icon={Briefcase}
        title="Nenhum projeto no quadro"
        description="Um kanban simples para acompanhar o que está em andamento no trabalho."
      />
    </div>
  );
}
