import { Wallet } from "lucide-react";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { SectionTitle } from "@/components/ui/section-title";
import { TransactionsLedger } from "@/components/financeiro/transactions-ledger";

function resolveMonth(monthParam: string | undefined) {
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    return monthParam;
  }
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthRange(monthDate: string) {
  const [year, month] = monthDate.split("-").map(Number);
  const start = `${monthDate}-01`;
  const endDate = new Date(Date.UTC(year, month, 0));
  const end = endDate.toISOString().slice(0, 10);
  return { start, end };
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await verifySession();
  const supabase = await createClient();

  const monthDate = resolveMonth((await searchParams).month);
  const { start, end } = monthRange(monthDate);

  const [{ data: categories }, { data: transactions }] = await Promise.all([
    supabase
      .from("transaction_categories")
      .select("id, name, type, color")
      .eq("user_id", user.id)
      .order("name"),
    supabase
      .from("transactions")
      .select("id, type, amount, description, occurred_on, category_id")
      .eq("user_id", user.id)
      .gte("occurred_on", start)
      .lte("occurred_on", end)
      .order("occurred_on"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle icon={Wallet} color="var(--thread-casa)">
        Financeiro
      </SectionTitle>
      <TransactionsLedger
        transactions={transactions ?? []}
        categories={categories ?? []}
        monthDate={monthDate}
      />
    </div>
  );
}
