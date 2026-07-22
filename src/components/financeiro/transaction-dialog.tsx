"use client";

import { forwardRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/app/actions/transactions";
import type { TransactionCategory } from "@/components/financeiro/transaction-category-manager";

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  occurred_on: string;
  category_id: string | null;
};

export type TransactionDialogTarget =
  | { mode: "create"; date: string }
  | { mode: "edit"; transaction: Transaction };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando…" : "Salvar"}
    </Button>
  );
}

function DeleteButton({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      formAction={action}
      formNoValidate
      variant="ghost"
      disabled={pending}
      className="text-danger hover:bg-danger/10"
    >
      {pending ? "Excluindo…" : "Excluir"}
    </Button>
  );
}

export const TransactionDialog = forwardRef<
  HTMLDialogElement,
  {
    target: TransactionDialogTarget | null;
    categories: TransactionCategory[];
    onClose: () => void;
  }
>(function TransactionDialog({ target, categories, onClose }, ref) {
  const showToast = useToast();

  const isEdit = target?.mode === "edit";
  const transaction = isEdit ? target.transaction : null;
  const defaultDate = target
    ? isEdit
      ? target.transaction.occurred_on.slice(0, 10)
      : target.date
    : "";

  async function handleSubmit(formData: FormData) {
    try {
      if (isEdit && transaction) {
        formData.set("id", transaction.id);
        await updateTransaction(formData);
        showToast("Lançamento atualizado");
      } else {
        await createTransaction(formData);
        showToast("Lançamento criado");
      }
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao salvar lançamento",
        "error",
      );
    }
  }

  async function handleDelete(formData: FormData) {
    try {
      await deleteTransaction(formData);
      showToast("Lançamento excluído");
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao excluir lançamento",
        "error",
      );
    }
  }

  return (
    <Dialog
      ref={ref}
      className="w-full max-w-md"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {target && (
        <TransactionForm
          key={isEdit ? transaction!.id : `create-${target.date}`}
          isEdit={isEdit}
          transaction={transaction}
          categories={categories}
          defaultDate={defaultDate}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
});

function TransactionForm({
  isEdit,
  transaction,
  categories,
  defaultDate,
  onSubmit,
  onDelete,
  onClose,
}: {
  isEdit: boolean;
  transaction: Transaction | null;
  categories: TransactionCategory[];
  defaultDate: string;
  onSubmit: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  onClose: () => void;
}) {
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "expense");
  const filteredCategories = categories.filter((category) => category.type === type);

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <h2 className="font-serif text-lg italic">
        {isEdit ? "Editar lançamento" : "Novo lançamento"}
      </h2>

      {isEdit && <input type="hidden" name="id" value={transaction!.id} />}

      <Field label="Tipo">
        <select
          name="type"
          value={type}
          onChange={(event) => setType(event.target.value as TransactionType)}
          className="h-10 w-full rounded-md border border-foreground/20 bg-transparent px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </select>
      </Field>

      <div className="flex gap-3">
        <Field label="Valor">
          <Input
            type="number"
            name="amount"
            step="0.01"
            min="0.01"
            defaultValue={transaction?.amount}
            required
          />
        </Field>
        <Field label="Data">
          <Input
            type="date"
            name="occurredOn"
            defaultValue={defaultDate}
            required
          />
        </Field>
      </div>

      <Field label="Categoria">
        <select
          name="categoryId"
          defaultValue={transaction?.category_id ?? ""}
          className="h-10 w-full rounded-md border border-foreground/20 bg-transparent px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="">Sem categoria</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Descrição (opcional)">
        <Input name="description" defaultValue={transaction?.description ?? ""} />
      </Field>

      <div className="flex items-center justify-between gap-2 pt-2">
        {isEdit ? <DeleteButton action={onDelete} /> : <span />}
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <SaveButton />
        </div>
      </div>
    </form>
  );
}
