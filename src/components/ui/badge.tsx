import { type CSSProperties, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type StateVariant = "ok" | "warn" | "crit" | "neutral";

type BadgeProps = {
  children: ReactNode;
  className?: string;
} & (
  | { variant: "thread"; color: string; icon?: LucideIcon }
  // etiqueta de estado sempre leva ícone — não é enfeite, é o que mantém a
  // informação legível pra quem não distingue cor (docs/styleguide.html)
  | { variant: StateVariant; icon: LucideIcon }
);

const STATE_CLASSES: Record<StateVariant, string> = {
  ok: "bg-ok/13 text-ok border-ok/30",
  warn: "bg-warn/13 text-warn border-warn/30",
  crit: "bg-crit/13 text-crit border-crit/30",
  neutral: "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--line)]",
};

// Mesma técnica do .badge-thread do guia: uma custom property por instância
// (--bg-thread) e uma única classe estática que faz color-mix em cima dela,
// em vez de recalcular a cor em JS a cada render.
const THREAD_CLASSES =
  "bg-[color-mix(in_srgb,var(--bg-thread)_13%,transparent)] text-[color-mix(in_srgb,var(--bg-thread)_74%,var(--foreground))] border-[color-mix(in_srgb,var(--bg-thread)_28%,transparent)]";

export function Badge({ icon: Icon, children, className = "", ...props }: BadgeProps) {
  const variantClasses = props.variant === "thread" ? THREAD_CLASSES : STATE_CLASSES[props.variant];
  const style =
    props.variant === "thread" ? ({ "--bg-thread": props.color } as CSSProperties) : undefined;

  return (
    <span
      style={style}
      className={`inline-flex h-[23px] items-center gap-[5px] whitespace-nowrap rounded-[7px] border px-[9px] font-mono text-[10.5px] font-medium tracking-[0.05em] uppercase ${variantClasses} ${className}`}
    >
      {Icon && <Icon aria-hidden size={12} strokeWidth={2.4} className="flex-none" />}
      {children}
    </span>
  );
}
