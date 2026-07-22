"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TransactionDialog,
  type Transaction,
  type TransactionDialogTarget,
} from "@/components/financeiro/transaction-dialog";
import type { TransactionCategory } from "@/components/financeiro/transaction-category-manager";

const currencyFormat = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const monthTitleFormat = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

function shiftMonth(monthDate: string, delta: number) {
  const [year, month] = monthDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function defaultCreateDate(monthDate: string) {
  const today = new Date();
  const todayMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  if (todayMonth === monthDate) {
    return today.toISOString().slice(0, 10);
  }
  return `${monthDate}-01`;
}

export function TransactionsLedger({
  transactions,
  categories,
  monthDate,
}: {
  transactions: Transaction[];
  categories: TransactionCategory[];
  monthDate: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [target, setTarget] = useState<TransactionDialogTarget | null>(null);

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const { totalIncome, totalExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const transaction of transactions) {
      if (transaction.type === "income") income += transaction.amount;
      else expense += transaction.amount;
    }
    return { totalIncome: income, totalExpense: expense };
  }, [transactions]);

  const balance = totalIncome - totalExpense;

  const monthTitle = monthTitleFormat.format(
    new Date(`${monthDate}-01T00:00:00`),
  );

  function openCreate() {
    setTarget({ mode: "create", date: defaultCreateDate(monthDate) });
    dialogRef.current?.showModal();
  }

  function openEdit(transaction: Transaction) {
    setTarget({ mode: "edit", transaction });
    dialogRef.current?.showModal();
  }

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl italic capitalize">{monthTitle}</h2>
        <div className="flex items-center gap-2">
          <Link
            href={`/financeiro?month=${shiftMonth(monthDate, -1)}`}
            className="inline-flex h-8 items-center justify-center rounded-md border border-foreground/20 px-3 text-sm font-medium transition hover:bg-foreground/5"
          >
            Mês anterior
          </Link>
          <Link
            href={`/financeiro?month=${currentMonth()}`}
            className="inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition hover:bg-foreground/5"
          >
            Hoje
          </Link>
          <Link
            href={`/financeiro?month=${shiftMonth(monthDate, 1)}`}
            className="inline-flex h-8 items-center justify-center rounded-md border border-foreground/20 px-3 text-sm font-medium transition hover:bg-foreground/5"
          >
            Próximo mês
          </Link>
          <Button className="h-8 px-3" onClick={openCreate}>
            Novo lançamento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 rounded-lg border border-foreground/10 p-4 text-sm">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.1em] text-foreground/50">
            Receitas
          </div>
          <div className="mt-1 font-medium">{currencyFormat.format(totalIncome)}</div>
        </div>
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.1em] text-foreground/50">
            Despesas
          </div>
          <div className="mt-1 font-medium">{currencyFormat.format(totalExpense)}</div>
        </div>
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.1em] text-foreground/50">
            Saldo
          </div>
          <div className={`mt-1 font-medium ${balance < 0 ? "text-danger" : ""}`}>
            {currencyFormat.format(balance)}
          </div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col gap-1.5 rounded-lg border border-foreground/10 bg-foreground/[0.02] p-4">
          <p className="text-sm font-medium">Nenhum lançamento neste mês.</p>
          <p className="text-sm text-foreground/70">
            Gastos, salário e investimentos entram aqui — lançados à mão, como
            num livro-caixa.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-foreground/10">
          {transactions.map((transaction) => {
            const category = transaction.category_id
              ? categoryById.get(transaction.category_id)
              : null;
            return (
              <button
                key={transaction.id}
                type="button"
                onClick={() => openEdit(transaction)}
                className="flex items-center gap-3 py-2.5 text-left text-sm hover:bg-foreground/[0.03]"
              >
                <span className="font-mono text-xs text-foreground/50">
                  {transaction.occurred_on.slice(8, 10)}/
                  {transaction.occurred_on.slice(5, 7)}
                </span>
                <span className="flex items-center gap-1.5 text-foreground/70">
                  {category && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: category.color ?? "#6b7280" }}
                    />
                  )}
                  {category?.name ?? "Sem categoria"}
                </span>
                <span className="flex-1 truncate text-foreground/70">
                  {transaction.description ?? ""}
                </span>
                <span
                  className={`font-mono ${
                    transaction.type === "income" ? "text-accent" : "text-danger"
                  }`}
                >
                  {transaction.type === "income" ? "+ " : "− "}
                  {currencyFormat.format(transaction.amount)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <TransactionDialog
        ref={dialogRef}
        target={target}
        categories={categories}
        onClose={() => {
          dialogRef.current?.close();
          setTarget(null);
        }}
      />
    </Card>
  );
}
