"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  createTransactionCategory,
  renameTransactionCategory,
  deleteTransactionCategory,
} from "@/app/actions/transaction-categories";

export type TransactionCategory = {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string | null;
};

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="h-8 px-3">
      {pending ? "Adicionando…" : "Adicionar"}
    </Button>
  );
}

function CategoryRow({ category }: { category: TransactionCategory }) {
  const [editing, setEditing] = useState(false);
  const showToast = useToast();

  async function handleRename(formData: FormData) {
    formData.set("id", category.id);
    try {
      await renameTransactionCategory(formData);
      showToast("Categoria atualizada");
      setEditing(false);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao renomear categoria",
        "error",
      );
    }
  }

  async function handleDelete() {
    const formData = new FormData();
    formData.set("id", category.id);
    try {
      await deleteTransactionCategory(formData);
      showToast("Categoria removida");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao remover categoria",
        "error",
      );
    }
  }

  if (editing) {
    return (
      <form action={handleRename} className="flex items-center gap-2">
        <input
          type="color"
          name="color"
          defaultValue={category.color ?? "#6b7280"}
          className="h-8 w-8 rounded-md border border-foreground/15"
        />
        <Input
          name="name"
          defaultValue={category.name}
          required
          autoFocus
          className="h-8 w-36"
        />
        <select
          name="type"
          defaultValue={category.type}
          className="h-8 rounded-md border border-foreground/20 bg-transparent px-2 text-sm outline-none focus:border-accent"
        >
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </select>
        <Button type="submit" variant="ghost" className="h-8 px-2">
          Salvar
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-8 px-2"
          onClick={() => setEditing(false)}
        >
          Cancelar
        </Button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-foreground/10 py-1 pl-3 pr-1 text-sm">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: category.color ?? "#6b7280" }}
      />
      <span>{category.name}</span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-full px-2 py-0.5 text-xs text-foreground/60 hover:bg-accent/10 hover:text-accent"
      >
        editar
      </button>
      <button
        type="button"
        onClick={handleDelete}
        className="rounded-full px-2 py-0.5 text-xs text-foreground/60 hover:bg-danger/10 hover:text-danger"
      >
        remover
      </button>
    </div>
  );
}

export function TransactionCategoryManager({
  categories,
}: {
  categories: TransactionCategory[];
}) {
  const showToast = useToast();
  const [type, setType] = useState<"income" | "expense">("expense");

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  async function handleCreate(formData: FormData) {
    try {
      await createTransactionCategory(formData);
      showToast("Categoria criada");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao criar categoria",
        "error",
      );
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-foreground/60">
          Receitas
        </h2>
        <div className="flex flex-wrap gap-2">
          {incomeCategories.length === 0 && (
            <span className="text-sm text-foreground/50">Nenhuma categoria</span>
          )}
          {incomeCategories.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-foreground/60">
          Despesas
        </h2>
        <div className="flex flex-wrap gap-2">
          {expenseCategories.length === 0 && (
            <span className="text-sm text-foreground/50">Nenhuma categoria</span>
          )}
          {expenseCategories.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))}
        </div>
      </div>

      <form
        key={categories.length}
        action={handleCreate}
        className="flex items-center gap-2"
      >
        <input
          type="color"
          name="color"
          defaultValue="#6b7280"
          className="h-8 w-8 rounded-md border border-foreground/15"
        />
        <Input
          name="name"
          placeholder="Nova categoria"
          required
          className="h-8 w-40"
        />
        <select
          name="type"
          value={type}
          onChange={(event) => setType(event.target.value as "income" | "expense")}
          className="h-8 rounded-md border border-foreground/20 bg-transparent px-2 text-sm outline-none focus:border-accent"
        >
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </select>
        <AddButton />
      </form>
    </Card>
  );
}
