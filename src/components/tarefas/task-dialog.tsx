"use client";

import { forwardRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createTask, updateTask, deleteTask } from "@/app/actions/tasks";

export type TaskCategory = { id: string; name: string; color: string };

export type RecurrenceFrequency = "none" | "daily" | "weekly" | "monthly";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  all_day: boolean;
  category_id: string | null;
  completed_at: string | null;
  recurrence_frequency: RecurrenceFrequency;
  recurrence_interval: number;
  recurrence_days_of_week: number[] | null;
  recurrence_end_date: string | null;
};

const WEEKDAYS = [
  { value: 0, label: "D" },
  { value: 1, label: "S" },
  { value: 2, label: "T" },
  { value: 3, label: "Q" },
  { value: 4, label: "Q" },
  { value: 5, label: "S" },
  { value: 6, label: "S" },
];

const INTERVAL_UNIT: Record<Exclude<RecurrenceFrequency, "none">, string> = {
  daily: "dia(s)",
  weekly: "semana(s)",
  monthly: "mês(es)",
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
        <TaskForm
          key={isEdit ? task!.id : `create-${target.date}`}
          isEdit={isEdit}
          task={task}
          categories={categories}
          defaultDate={defaultDate}
          defaultTime={defaultTime}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
});

function TaskForm({
  isEdit,
  task,
  categories,
  defaultDate,
  defaultTime,
  onSubmit,
  onDelete,
  onClose,
}: {
  isEdit: boolean;
  task: Task | null;
  categories: TaskCategory[];
  defaultDate: string;
  defaultTime: string;
  onSubmit: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  onClose: () => void;
}) {
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>(
    task?.recurrence_frequency ?? "none",
  );

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <h2 className="font-serif text-lg italic">
        {isEdit ? "Editar tarefa" : "Nova tarefa"}
      </h2>

      {isEdit && <input type="hidden" name="id" value={task!.id} />}

      <Field label="Título">
        <Input name="title" defaultValue={task?.title} required autoFocus />
      </Field>

      <div className="flex gap-3">
        <Field label="Data">
          <Input type="date" name="date" defaultValue={defaultDate} required />
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

      <Field label="Repetir">
        <select
          name="recurrenceFrequency"
          value={recurrenceFrequency}
          onChange={(event) =>
            setRecurrenceFrequency(event.target.value as RecurrenceFrequency)
          }
          className="h-10 w-full rounded-md border border-foreground/20 bg-transparent px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="none">Nenhuma</option>
          <option value="daily">Diariamente</option>
          <option value="weekly">Semanalmente</option>
          <option value="monthly">Mensalmente</option>
        </select>
      </Field>

      {recurrenceFrequency !== "none" && (
        <>
          <Field label={`A cada (${INTERVAL_UNIT[recurrenceFrequency]})`}>
            <Input
              type="number"
              name="recurrenceInterval"
              min={1}
              defaultValue={task?.recurrence_interval ?? 1}
            />
          </Field>

          {recurrenceFrequency === "weekly" && (
            <fieldset className="flex flex-col gap-1.5">
              <legend className="text-sm font-medium">Dias da semana</legend>
              <div className="flex gap-1.5">
                {WEEKDAYS.map((day) => (
                  <label
                    key={day.value}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-foreground/20 text-xs font-medium has-[:checked]:border-accent has-[:checked]:bg-accent has-[:checked]:text-background"
                  >
                    <input
                      type="checkbox"
                      name="recurrenceDaysOfWeek"
                      value={day.value}
                      defaultChecked={task?.recurrence_days_of_week?.includes(day.value)}
                      className="sr-only"
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <Field label="Repetir até (opcional)">
            <Input
              type="date"
              name="recurrenceEndDate"
              defaultValue={task?.recurrence_end_date ?? ""}
            />
          </Field>
        </>
      )}

      {isEdit &&
        (task!.recurrence_frequency === "none" ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="completed"
              defaultChecked={!!task!.completed_at}
              className="size-4 accent-accent"
            />
            Concluída
          </label>
        ) : (
          <p className="text-xs text-foreground/60">
            Marque cada ocorrência direto no calendário.
          </p>
        ))}

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
