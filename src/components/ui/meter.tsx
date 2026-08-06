import { type ReactNode } from "react";

export function Meter({
  label,
  valueLabel,
  percent,
  targetPercent,
  color,
  legend,
  className = "",
}: {
  label: ReactNode;
  valueLabel: ReactNode;
  /** 0–100, relativo à escala cheia da trilha (não à distância até o alvo). */
  percent: number;
  targetPercent?: number;
  color?: string;
  legend?: ReactNode;
  className?: string;
}) {
  const fill = Math.min(100, Math.max(0, percent));
  const target = targetPercent === undefined ? undefined : Math.min(100, Math.max(0, targetPercent));

  return (
    <div className={`flex flex-col gap-[7px] ${className}`}>
      <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
        <span>{label}</span>
        <span className="font-mono text-[13px] text-[var(--muted)] tabular-nums">{valueLabel}</span>
      </div>
      {/* sem overflow-hidden: a marca de alvo abaixo precisa transbordar a
          trilha verticalmente (top/bottom negativos) para ficar visível */}
      <div className="relative h-2 rounded-full bg-[color-mix(in_srgb,var(--foreground)_9%,transparent)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${fill}%`, background: color ?? "var(--accent)" }}
        />
        {target !== undefined && (
          <div
            aria-hidden
            className="absolute -top-1 -bottom-1 w-[1.5px] bg-foreground opacity-60 after:absolute after:-top-[3px] after:-left-[2.25px] after:border-x-[3px] after:border-x-transparent after:border-t-[4px] after:border-t-foreground after:opacity-75 after:content-['']"
            style={{ left: `${target}%` }}
          />
        )}
      </div>
      {legend && (
        <span className="font-mono text-[10.5px] tracking-[0.04em] text-[var(--muted-2)]">{legend}</span>
      )}
    </div>
  );
}
