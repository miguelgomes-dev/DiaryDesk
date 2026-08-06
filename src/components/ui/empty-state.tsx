import { type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center rounded-[10px] border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-8 text-center ${className}`}
    >
      <span
        aria-hidden
        className="mb-[14px] flex h-11 w-11 flex-none items-center justify-center rounded-xl text-[var(--muted-2)]"
        style={{
          background: "color-mix(in srgb, currentColor 13%, transparent)",
          border: "1px solid color-mix(in srgb, currentColor 22%, transparent)",
        }}
      >
        <Icon size={26} strokeWidth={1.5} />
      </span>
      <h4 className="mb-[5px] text-base font-semibold tracking-[-0.015em]">{title}</h4>
      <p className="mx-auto mb-4 max-w-[38ch] text-sm text-[var(--muted)]">{description}</p>
      {action}
    </div>
  );
}
