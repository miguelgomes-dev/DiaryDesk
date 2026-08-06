"use client";

import { forwardRef } from "react";
import { useFormStatus } from "react-dom";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  setOccurrenceStatus,
  clearOccurrenceStatus,
  type TaskOccurrence,
} from "@/app/actions/task-occurrences";

function StatusButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

function SkipButton({
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
      variant="secondary"
      disabled={pending}
    >
      {pending ? "Salvando…" : "Pular"}
    </Button>
  );
}

export const OccurrenceDialog = forwardRef<
  HTMLDialogElement,
  {
    occurrence: TaskOccurrence | null;
    onClose: () => void;
    onEditSeries: () => void;
  }
>(function OccurrenceDialog({ occurrence, onClose, onEditSeries }, ref) {
  const showToast = useToast();

  async function handleComplete(formData: FormData) {
    formData.set("status", "done");
    try {
      await setOccurrenceStatus(formData);
      showToast("Ocorrência concluída");
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao atualizar ocorrência",
        "error",
      );
    }
  }

  async function handleSkip(formData: FormData) {
    formData.set("status", "skipped");
    try {
      await setOccurrenceStatus(formData);
      showToast("Ocorrência pulada");
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao atualizar ocorrência",
        "error",
      );
    }
  }

  async function handleClear(formData: FormData) {
    try {
      await clearOccurrenceStatus(formData);
      showToast("Status desfeito");
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao desfazer status",
        "error",
      );
    }
  }

  const formattedDate = occurrence
    ? new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      }).format(new Date(`${occurrence.occurrenceDate}T00:00:00`))
    : "";

  return (
    <Dialog
      ref={ref}
      className="w-full max-w-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {occurrence && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-[640] tracking-[-0.025em]">{occurrence.title}</h2>
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-foreground/50">
              {formattedDate}
            </p>
          </div>

          <form action={handleComplete} className="flex gap-2">
            <input type="hidden" name="taskId" value={occurrence.taskId} />
            <input
              type="hidden"
              name="occurrenceDate"
              value={occurrence.occurrenceDate}
            />
            <StatusButton label="Concluir" pendingLabel="Salvando…" />
            <SkipButton action={handleSkip} />
          </form>

          {occurrence.status && (
            <form action={handleClear}>
              <input type="hidden" name="taskId" value={occurrence.taskId} />
              <input
                type="hidden"
                name="occurrenceDate"
                value={occurrence.occurrenceDate}
              />
              <Button type="submit" variant="ghost" className="w-full">
                Desfazer
              </Button>
            </form>
          )}

          <div className="flex items-center justify-between gap-2 border-t border-foreground/10 pt-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Fechar
            </Button>
            <Button type="button" variant="secondary" onClick={onEditSeries}>
              Editar série
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
});
