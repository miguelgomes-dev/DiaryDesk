import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

// Alturas exatas do guia (docs/styleguide.html, seção Botões): sm=32px
// coincide com o h-8 do Tailwind, lg=44px com h-11 — só o md (38px) não
// tem utilitário nativo e precisa de valor arbitrário.
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 rounded-[7px] px-[11px] text-[13px]",
  md: "h-[38px] rounded-lg px-[15px] text-sm",
  lg: "h-11 rounded-[9px] px-[19px] text-[15px]",
};

const ICON_ONLY_CLASSES: Record<ButtonSize, string> = {
  sm: "w-8 px-0",
  md: "w-[38px] px-0",
  lg: "w-11 px-0",
};

const ICON_SIZE: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 16 };

// Hierarquia por peso visual, não só cor (guia, seção Botões): o primário
// "sobe do papel" com brilho + sombra; o secundário tem contorno próprio;
// o fantasma só aparece no hover; o de perigo usa a tinta de --danger.
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-foreground text-background bg-[image:linear-gradient(180deg,var(--btn-sheen),transparent_60%)] shadow-[var(--shadow-2)] hover:-translate-y-px hover:shadow-[0_4px_10px_rgba(0,0,0,.16),0_1px_2px_rgba(0,0,0,.08)] active:translate-y-0 active:shadow-[inset_0_2px_4px_rgba(0,0,0,.22)]",
  secondary:
    "border-[var(--line)] bg-background text-foreground shadow-[var(--shadow-1)] hover:bg-[var(--surface-2)] hover:border-foreground/26 active:translate-y-0 active:shadow-[inset_0_1px_3px_rgba(0,0,0,.1)]",
  ghost: "border-transparent bg-transparent text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-foreground",
  danger:
    "border-danger/26 bg-danger/[0.07] text-danger hover:bg-danger/[0.14] hover:border-danger/40",
};

type CommonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Ícone lucide-react à esquerda do texto (ou sozinho, com iconOnly). */
  icon?: LucideIcon;
  /** Troca o ícone por um spinner e desativa o botão. */
  loading?: boolean;
  children?: ReactNode;
};

// Botão só-ícone precisa de rótulo acessível — sem isso um leitor de tela
// só anuncia "botão". O tipo força aria-label quando iconOnly é true.
export type ButtonProps =
  | (CommonProps & { iconOnly: true; "aria-label": string })
  | (CommonProps & { iconOnly?: false });

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    icon: Icon,
    iconOnly = false,
    loading = false,
    className = "",
    disabled,
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-[7px] whitespace-nowrap border font-[530] tracking-[-0.005em] outline-none [transition:background_.14s,border-color_.14s,box-shadow_.14s,transform_.1s,color_.14s] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-[.45] ${SIZE_CLASSES[size]} ${iconOnly ? ICON_ONLY_CLASSES[size] : ""} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden
          className="h-3.5 w-3.5 flex-none animate-spin rounded-full"
          style={{
            animationDuration: "0.7s",
            border: "2px solid color-mix(in srgb, currentColor 28%, transparent)",
            borderTopColor: "currentColor",
          }}
        />
      ) : (
        Icon && <Icon aria-hidden className="flex-none" size={ICON_SIZE[size]} strokeWidth={2} />
      )}
      {!iconOnly && children}
    </button>
  );
});
