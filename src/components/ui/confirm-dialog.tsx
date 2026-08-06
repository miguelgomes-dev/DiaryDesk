"use client";

import { forwardRef, type ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const ConfirmDialog = forwardRef<
  HTMLDialogElement,
  {
    title: string;
    description?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }
>(function ConfirmDialog(
  {
    title,
    description,
    confirmLabel = "Remover",
    cancelLabel = "Cancelar",
    loading = false,
    onConfirm,
    onCancel,
  },
  ref,
) {
  return (
    <Dialog
      ref={ref}
      className="w-full max-w-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-[640] tracking-[-0.025em]">{title}</h2>
          {description && <p className="text-sm text-[var(--muted)]">{description}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="danger" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
});
