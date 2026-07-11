"use client";

import { forwardRef } from "react";
import { useFormStatus } from "react-dom";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createTask, updateTask, deleteTask } from "@/app/actions/tasks";

export type TaskCategory = { id: string; name: string; color: string };

export type Task = {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  all_day: boolean;
  category_id: string | null;
  completed_at: string | null;
};

export type TaskDialogTarget =
  | { mode: "create"; date: string }
  | { mode: "edit"; task: Task };

function toDateInputValue(iso: string) {
  return iso.slice(0, 10);
}

function toTimeInputValue(iso: string) {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

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

export const TaskDialog = forwardRef<
  HTMLDialogElement,
  {
    target: TaskDialogTarget | null;
    categories: TaskCategory[];
    onClose: () => void;
  }
>(function TaskDialog({ target, categories, onClose }, ref) {
  const showToast = useToast();

  const isEdit = target?.mode === "edit";
  const task = isEdit ? target.task : null;
  const defaultDate = target
    ? isEdit
      ? toDateInputValue(target.task.start_at)
      : target.date
    : "";
  const defaultTime = isEdit && task && !task.all_day
    ? toTimeInputValue(task.start_at)
    : "";

  async function handleSubmit(formData: FormData) {
    try {
      if (isEdit && task) {
        formData.set("id", task.id);
        await updateTask(formData);
        showToast("Tarefa atualizada");
      } else {
        await createTask(formData);
        showToast("Tarefa criada");
      }
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao salvar tarefa",
        "error",
      );
    }
  }

  async function handleDelete(formData: FormData) {
    try {
      await deleteTask(formData);
      showToast("Tarefa excluída");
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao excluir tarefa",
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
        <form
          key={isEdit ? task!.id : `create-${target.date}`}
          action={handleSubmit}
          className="flex flex-col gap-4"
        >
          <h2 className="font-serif text-lg italic">
            {isEdit ? "Editar tarefa" : "Nova tarefa"}
          </h2>

          {isEdit && <input type="hidden" name="id" value={task!.id} />}

          <Field label="Título">
            <Input name="title" defaultValue={task?.title} required autoFocus />
          </Field>

          <div className="flex gap-3">
            <Field label="Data">
              <Input
                type="date"
                name="date"
                defaultValue={defaultDate}
                required
              />
            </Field>
            <Field label="Horário (opcional)">
              <Input type="time" name="time" defaultValue={defaultTime} />
            </Field>
          </div>

          <Field label="Categoria">
            <select
              name="categoryId"
              defaultValue={task?.category_id ?? ""}
              className="h-10 w-full rounded-md border border-foreground/20 bg-transparent px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Descrição (opcional)">
            <textarea
              name="description"
              defaultValue={task?.description ?? ""}
              rows={3}
              className="w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </Field>

          {isEdit && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="completed"
                defaultChecked={!!task!.completed_at}
                className="size-4 accent-accent"
              />
              Concluída
            </label>
          )}

          <div className="flex items-center justify-between gap-2 pt-2">
            {isEdit ? <DeleteButton action={handleDelete} /> : <span />}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <SaveButton />
            </div>
          </div>
        </form>
      )}
    </Dialog>
  );
});
