"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Dialog } from "@/components/ui/dialog";
import { Dropdown } from "@/components/ui/dropdown";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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

const TYPE_GROUPS = [
  {
    options: [
      { value: "income", label: "Receita" },
      { value: "expense", label: "Despesa" },
    ],
  },
];

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Criar
    </Button>
  );
}

function CategoryRow({
  category,
  onRequestDelete,
}: {
  category: TransactionCategory;
  onRequestDelete: (category: TransactionCategory) => void;
}) {
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

  if (editing) {
    return (
      <form
        action={handleRename}
        className="flex items-center gap-2 rounded-lg border border-[var(--line-soft)] bg-[var(--surface)] px-3 py-2"
      >
        <input
          type="color"
          name="color"
          defaultValue={category.color ?? "#6b7280"}
          className="h-8 w-8 shrink-0 rounded-md border border-foreground/15"
        />
        <Input name="name" defaultValue={category.name} required autoFocus className="h-8 flex-1" />
        <Dropdown name="type" defaultValue={category.type} size="sm" className="w-28" groups={TYPE_GROUPS} />
        <Button type="submit" variant="ghost" size="sm">
          Salvar
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
          Cancelar
        </Button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--line-soft)] bg-[var(--surface)] px-3 py-2">
      <span
        aria-hidden
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: category.color ?? "#6b7280" }}
      />
      <span className="flex-1 truncate text-sm">{category.name}</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        iconOnly
        icon={Pencil}
        aria-label={`Editar categoria ${category.name}`}
        onClick={() => setEditing(true)}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        iconOnly
        icon={Trash2}
        aria-label={`Remover categoria ${category.name}`}
        className="hover:text-danger"
        onClick={() => onRequestDelete(category)}
      />
    </div>
  );
}

function CategoryList({
  title,
  categories,
  onRequestDelete,
}: {
  title: string;
  categories: TransactionCategory[];
  onRequestDelete: (category: TransactionCategory) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-foreground/60">
        {title}
      </h2>
      <div className="flex flex-col gap-1.5">
        {categories.length === 0 && (
          <span className="text-sm text-foreground/50">Nenhuma categoria</span>
        )}
        {categories.map((category) => (
          <CategoryRow key={category.id} category={category} onRequestDelete={onRequestDelete} />
        ))}
      </div>
    </div>
  );
}

const CreateCategoryDialog = forwardRef<
  HTMLDialogElement,
  { formKey: number; onCreated: () => void; onClose: () => void }
>(function CreateCategoryDialog({ formKey, onCreated, onClose }, ref) {
  const showToast = useToast();

  async function handleCreate(formData: FormData) {
    try {
      await createTransactionCategory(formData);
      showToast("Categoria criada");
      onCreated();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao criar categoria",
        "error",
      );
    }
  }

  return (
    <Dialog
      ref={ref}
      className="w-full max-w-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form key={formKey} action={handleCreate} className="flex flex-col gap-4">
        <h2 className="text-lg font-[640] tracking-[-0.025em]">Nova categoria</h2>
        <Field label="Cor">
          <input
            type="color"
            name="color"
            defaultValue="#6b7280"
            className="h-10 w-16 rounded-md border border-foreground/15"
          />
        </Field>
        <Field label="Nome">
          <Input name="name" placeholder="Ex: Mercado" required autoFocus />
        </Field>
        <Field label="Tipo">
          <Dropdown name="type" defaultValue="expense" groups={TYPE_GROUPS} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <SaveButton />
        </div>
      </form>
    </Dialog>
  );
});

export function TransactionCategoryManager({
  categories,
}: {
  categories: TransactionCategory[];
}) {
  const showToast = useToast();
  const [deleteTarget, setDeleteTarget] = useState<TransactionCategory | null>(null);
  const [deleting, setDeleting] = useState(false);
  const confirmDialogRef = useRef<HTMLDialogElement>(null);

  const [createFormKey, setCreateFormKey] = useState(0);
  const createDialogRef = useRef<HTMLDialogElement>(null);

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  useEffect(() => {
    const dialog = confirmDialogRef.current;
    if (!dialog) return;
    // Cobre o Esc: o navegador fecha o <dialog> sozinho, sem passar pelo
    // onCancel do ConfirmDialog — sem isso, deleteTarget ficaria obsoleto.
    const handleClose = () => setDeleteTarget(null);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  function requestDelete(category: TransactionCategory) {
    setDeleteTarget(category);
    confirmDialogRef.current?.showModal();
  }

  function closeConfirm() {
    confirmDialogRef.current?.close();
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const formData = new FormData();
    formData.set("id", deleteTarget.id);
    try {
      await deleteTransactionCategory(formData);
      showToast("Categoria removida");
      closeConfirm();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao remover categoria",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  }

  function openCreate() {
    setCreateFormKey((key) => key + 1);
    createDialogRef.current?.showModal();
  }

  function closeCreate() {
    createDialogRef.current?.close();
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-foreground/60">
          Categorias
        </h2>
        <Button type="button" size="sm" icon={Plus} onClick={openCreate}>
          Nova categoria
        </Button>
      </div>
      <CategoryList title="Receitas" categories={incomeCategories} onRequestDelete={requestDelete} />
      <hr className="m-0 border-0 border-t border-[var(--line-soft)]" />
      <CategoryList title="Despesas" categories={expenseCategories} onRequestDelete={requestDelete} />

      <CreateCategoryDialog
        ref={createDialogRef}
        formKey={createFormKey}
        onCreated={closeCreate}
        onClose={closeCreate}
      />

      <ConfirmDialog
        ref={confirmDialogRef}
        title={`Remover "${deleteTarget?.name ?? ""}"?`}
        description="Os lançamentos dessa categoria não são apagados, só ficam sem categoria. Essa ação não pode ser desfeita."
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={closeConfirm}
      />
    </Card>
  );
}
