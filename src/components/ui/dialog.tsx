"use client";

import { forwardRef, type HTMLAttributes } from "react";

export const Dialog = forwardRef<
  HTMLDialogElement,
  HTMLAttributes<HTMLDialogElement>
>(function Dialog({ className = "", children, ...props }, ref) {
  return (
    <dialog
      ref={ref}
      className={`m-auto rounded-lg border border-foreground/10 bg-background p-6 text-foreground backdrop:bg-black/40 ${className}`}
      {...props}
    >
      {children}
    </dialog>
  );
});
