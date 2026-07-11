import { Card } from "@/components/ui/card";

export default function FinanceiroPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl italic">Financeiro</h1>
      <Card ribbon="var(--thread-casa)" className="flex flex-col gap-1.5">
        <p className="text-sm font-medium">Nenhum lançamento neste mês.</p>
        <p className="text-sm text-foreground/70">
          Gastos, salário e investimentos entram aqui — lançados à mão, como
          num livro-caixa.
        </p>
      </Card>
    </div>
  );
}
