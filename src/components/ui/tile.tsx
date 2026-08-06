import { type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function Tile({
  icon: Icon,
  iconColor,
  label,
  value,
  unit,
  delta,
  deltaTone = "neutral",
  className = "",
}: {
  icon?: LucideIcon;
  iconColor?: string;
  label: string;
  value: ReactNode;
  unit?: string;
  delta?: ReactNode;
  /** "pos"/"neg" descrevem se a notícia é boa/ruim, não se o número subiu — a
   * seta dentro de `delta` é quem mostra a direção real. */
  deltaTone?: "pos" | "neg" | "neutral";
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-[10px] border border-[var(--line-soft)] bg-[var(--surface)] px-[15px] py-[14px] ${className}`}
    >
      <div className="flex items-center gap-[7px]">
        {Icon && (
          <Icon aria-hidden size={15} strokeWidth={2} style={{ color: iconColor }} className="flex-none" />
        )}
        <span className="font-mono text-[9.5px] tracking-[0.12em] text-[var(--muted-2)] uppercase">
          {label}
        </span>
      </div>
      <span className="font-mono text-[29px] leading-[1.14] font-medium tracking-[-0.035em] tabular-nums">
        {value}
        {unit && (
          <span className="ml-[3px] font-sans text-sm font-[450] tracking-normal text-[var(--muted)]">
            {unit}
          </span>
        )}
      </span>
      {delta && (
        <span
          className={`flex items-center gap-1 font-mono text-[11.5px] tabular-nums ${
            deltaTone === "pos" ? "text-ok" : deltaTone === "neg" ? "text-crit" : "text-[var(--muted-2)]"
          }`}
        >
          {delta}
        </span>
      )}
    </div>
  );
}
