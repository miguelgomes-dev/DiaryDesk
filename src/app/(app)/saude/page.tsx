import { Heart } from "lucide-react";
import { SectionTitle } from "@/components/ui/section-title";
import { EmptyState } from "@/components/ui/empty-state";

export default function SaudePage() {
  return (
    <div className="flex flex-col gap-6">
      <SectionTitle icon={Heart} color="var(--thread-saude)">
        Saúde
      </SectionTitle>
      <EmptyState
        icon={Heart}
        title="Nenhum registro de saúde ainda"
        description="Peso, exames e consultas ficam guardados aqui, só para você."
      />
    </div>
  );
}
