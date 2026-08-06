import { type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type Size = "lg" | "sm";

const CHIP_CLASSES: Record<Size, string> = {
  lg: "h-[34px] w-[34px] rounded-[9px]",
  sm: "h-7 w-7 rounded-lg",
};

const ICON_SIZE: Record<Size, number> = { lg: 20, sm: 16 };

const TEXT_CLASSES: Record<Size, string> = {
  lg: "text-3xl font-[650] tracking-[-0.033em]",
  sm: "text-lg font-[640] tracking-[-0.025em]",
};

/**
 * Título de tela (h1) ou de subseção (h2): ícone da seção num chip colorido
 * com a "thread" da seção — mesma técnica do .chip/.sec-head do guia — mais
 * um divisor fino embaixo, separando o cabeçalho do conteúdo.
 */
export function SectionTitle({
  as: Tag = "h1",
  icon: Icon,
  color,
  size = "lg",
  eyebrow,
  children,
  divider = true,
  className = "",
}: {
  as?: "h1" | "h2";
  icon: LucideIcon;
  color: string;
  size?: Size;
  eyebrow?: ReactNode;
  children: ReactNode;
  divider?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-3 ${divider ? "border-b border-[var(--line)] pb-4" : ""} ${className}`}
    >
      {eyebrow}
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={`flex flex-none items-center justify-center ${CHIP_CLASSES[size]}`}
          style={{
            color,
            background: "color-mix(in srgb, currentColor 13%, transparent)",
            border: "1px solid color-mix(in srgb, currentColor 22%, transparent)",
          }}
        >
          <Icon size={ICON_SIZE[size]} strokeWidth={1.75} />
        </span>
        <Tag className={TEXT_CLASSES[size]}>{children}</Tag>
      </div>
    </div>
  );
}
