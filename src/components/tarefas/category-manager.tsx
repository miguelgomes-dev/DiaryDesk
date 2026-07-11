"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  createTaskCategory,
  renameTaskCategory,
  deleteTaskCategory,
} from "@/app/actions/task-categories";

type Category = { id: string; name: string; color: string };

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="h-8 px-3">
      {pending ? "Adicionando…" : "Adicionar"}
    </Button>
  );
}

function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const showToast = useToast();

  async function handleRename(formData: FormData) {
    formData.set("id", category.id);
    try {
      await renameTaskCategory(formData);
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
      await deleteTaskCategory(formData);
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
          defaultValue={category.color}
          className="h-8 w-8 rounded-md border border-foreground/15"
        />
        <Input
          name="name"
          defaultValue={category.name}
          required
          autoFocus
          className="h-8 w-36"
        />
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
        style={{ backgroundColor: category.color }}
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

export function CategoryManager({ categories }: { categories: Category[] }) {
  const showToast = useToast();

  async function handleCreate(formData: FormData) {
    try {
      await createTaskCategory(formData);
      showToast("Categoria criada");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao criar categoria",
        "error",
      );
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <h2 className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-foreground/60">
        Categorias
      </h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <CategoryRow key={category.id} category={category} />
        ))}
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
        <AddButton />
      </form>
    </Card>
  );
}
