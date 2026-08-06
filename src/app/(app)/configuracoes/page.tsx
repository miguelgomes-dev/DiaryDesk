import { CalendarCheck, Settings, Wallet } from "lucide-react";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { SectionTitle } from "@/components/ui/section-title";
import { CategoryManager } from "@/components/tarefas/category-manager";
import { TransactionCategoryManager } from "@/components/financeiro/transaction-category-manager";

export default async function ConfiguracoesPage() {
  const user = await verifySession();
  const supabase = await createClient();

  const [{ data: taskCategories }, { data: transactionCategories }] = await Promise.all([
    supabase
      .from("task_categories")
      .select("id, name, color")
      .eq("user_id", user.id)
      .order("name"),
    supabase
      .from("transaction_categories")
      .select("id, name, type, color")
      .eq("user_id", user.id)
      .order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle icon={Settings} color="var(--foreground)">
        Configurações
      </SectionTitle>

      <div className="flex flex-col gap-3">
        <SectionTitle as="h2" size="sm" icon={CalendarCheck} color="var(--accent)">
          Tarefas
        </SectionTitle>
        <CategoryManager categories={taskCategories ?? []} />
      </div>

      <div className="flex flex-col gap-3">
        <SectionTitle as="h2" size="sm" icon={Wallet} color="var(--thread-casa)">
          Financeiro
        </SectionTitle>
        <TransactionCategoryManager categories={transactionCategories ?? []} />
      </div>
    </div>
  );
}
