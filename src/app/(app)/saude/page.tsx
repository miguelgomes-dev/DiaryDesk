import { Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function SaudePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-[650] tracking-[-0.033em]">Saúde</h1>
      <EmptyState
        icon={Heart}
        title="Nenhum registro de saúde ainda"
        description="Peso, exames e consultas ficam guardados aqui, só para você."
      />
    </div>
  );
}
