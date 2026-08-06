"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";

export type DropdownOption = {
  value: string;
  label: string;
  icon?: LucideIcon;
  /** CSS color for the icon (ex: a categoria "thread"). Sem cor, herda a tinta do texto. */
  color?: string;
};

/** Um grupo sem `label` some do cabeçalho mas ainda ganha o separador antes dele. */
export type DropdownGroup = {
  label?: string;
  options: DropdownOption[];
};

type DropdownSize = "sm" | "md";

const TRIGGER_SIZE_CLASSES: Record<DropdownSize, string> = {
  sm: "h-8 rounded-[7px] px-[9px] text-[13px]",
  md: "h-[38px] rounded-lg px-3 text-sm",
};

const TRIGGER_ICON_SIZE: Record<DropdownSize, number> = { sm: 13, md: 15 };

type BaseProps = {
  name: string;
  groups: DropdownGroup[];
  placeholder?: string;
  disabled?: boolean;
  size?: DropdownSize;
  className?: string;
};

type DropdownProps =
  | (BaseProps & { value: string; onValueChange: (value: string) => void; defaultValue?: undefined })
  | (BaseProps & { value?: undefined; onValueChange?: (value: string) => void; defaultValue?: string });

const RING_STYLE = {
  borderColor: "var(--accent)",
  boxShadow: "0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent)",
};

export function Dropdown({
  name,
  groups,
  placeholder = "Selecione",
  disabled,
  size = "md",
  className = "",
  ...controlled
}: DropdownProps) {
  const isControlled = controlled.value !== undefined;
  const [internalValue, setInternalValue] = useState(controlled.defaultValue ?? "");
  const value = isControlled ? controlled.value! : internalValue;

  const options = useMemo(() => groups.flatMap((group) => group.options), [groups]);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];
  const SelectedIcon = selected?.icon;

  // Cada grupo carrega o índice (na lista achatada) do seu primeiro option,
  // pra navegação por seta funcionar através dos grupos sem um contador
  // mutável durante o render.
  const groupsWithOffset = useMemo(
    () =>
      groups.map((group, i) => ({
        ...group,
        startIndex: groups.slice(0, i).reduce((sum, g) => sum + g.options.length, 0),
      })),
    [groups],
  );

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(Math.max(0, selectedIndex));

  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function openDropdown() {
    setActiveIndex(Math.max(0, selectedIndex));
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function commit(index: number) {
    const option = options[index];
    if (!option) return;
    if (!isControlled) setInternalValue(option.value);
    controlled.onValueChange?.(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  // Foco permanece sempre no gatilho — o teclado é tratado aqui, no
  // contêiner, exatamente como no JS vanilla do guia (dd.addEventListener
  // 'keydown'), em vez de mover o foco pra dentro do painel.
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (open) {
        setActiveIndex((i) => Math.min(options.length - 1, i + 1));
      } else {
        openDropdown();
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (open) {
        setActiveIndex((i) => Math.max(0, i - 1));
      } else {
        openDropdown();
      }
    } else if (event.key === "Home" && open) {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End" && open) {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      commit(activeIndex);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  return (
    <div
      ref={rootRef}
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <input type="hidden" name={name} value={value} />
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${baseId}-panel`}
        onClick={() => (open ? setOpen(false) : openDropdown())}
        style={open ? RING_STYLE : undefined}
        className={`flex w-full items-center gap-[9px] border border-[var(--line)] bg-background text-left text-foreground shadow-[var(--shadow-1)] outline-none transition-[border-color,box-shadow] duration-150 hover:border-foreground/26 focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_22%,transparent)] disabled:pointer-events-none disabled:opacity-45 ${TRIGGER_SIZE_CLASSES[size]}`}
      >
        {SelectedIcon && (
          <SelectedIcon
            aria-hidden
            className="flex-none"
            size={TRIGGER_ICON_SIZE[size]}
            strokeWidth={2}
            style={{ color: selected?.color }}
          />
        )}
        <span className="flex-1 truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          aria-hidden
          size={15}
          strokeWidth={2}
          className={`flex-none text-[var(--muted-2)] transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id={`${baseId}-panel`}
          role="listbox"
          className="absolute top-[calc(100%+6px)] left-0 right-0 z-40 max-h-[262px] overflow-y-auto rounded-[10px] border border-[var(--line)] bg-background p-[5px] shadow-[var(--shadow-pop)]"
        >
          {groupsWithOffset.map((group, groupIndex) => (
            <div key={groupIndex}>
              {groupIndex > 0 && <div className="my-1 h-px bg-[var(--line-soft)]" />}
              {group.label && (
                <div className="px-[9px] pb-1 pt-[7px] font-mono text-[9.5px] uppercase tracking-[0.13em] text-[var(--muted-2)]">
                  {group.label}
                </div>
              )}
              {group.options.map((option, i) => {
                const index = group.startIndex + i;
                const isSelected = option.value === value;
                const isActive = index === activeIndex;
                const OptionIcon = option.icon;
                return (
                  <button
                    key={option.value}
                    id={`${baseId}-opt-${index}`}
                    ref={(el) => {
                      optionRefs.current[index] = el;
                    }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => commit(index)}
                    className={`flex w-full items-center gap-[9px] rounded-md px-[9px] py-[7px] text-left text-[13.5px] text-foreground ${
                      isSelected ? "font-[560]" : ""
                    } ${isActive ? "bg-[var(--surface-2)]" : ""}`}
                  >
                    {OptionIcon && (
                      <OptionIcon
                        aria-hidden
                        className="flex-none"
                        size={15}
                        strokeWidth={2}
                        style={{ color: option.color }}
                      />
                    )}
                    <span className="flex-1 truncate">{option.label}</span>
                    <Check
                      aria-hidden
                      size={15}
                      strokeWidth={2.4}
                      className={`flex-none text-accent ${isSelected ? "opacity-100" : "opacity-0"}`}
                    />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
