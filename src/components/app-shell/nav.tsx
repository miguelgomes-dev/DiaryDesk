"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS: { href: string; label: string; thread: string }[] = [
  { href: "/", label: "Dashboard", thread: "var(--foreground)" },
  { href: "/tarefas", label: "Tarefas", thread: "var(--accent)" },
  { href: "/financeiro", label: "Financeiro", thread: "var(--thread-casa)" },
  { href: "/saude", label: "Saúde", thread: "var(--thread-saude)" },
  { href: "/faculdade", label: "Faculdade", thread: "var(--thread-faculdade)" },
  { href: "/trabalho", label: "Trabalho", thread: "var(--thread-trabalho)" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:gap-0.5 md:overflow-visible md:py-3">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors md:rounded-none md:pl-4 md:pr-5 ${
              active
                ? "bg-foreground/[0.04] text-foreground"
                : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full transition-opacity"
              style={{ backgroundColor: item.thread, opacity: active ? 1 : 0.35 }}
            />
            {item.label}
            {active && (
              <span
                aria-hidden
                className="ribbon ribbon-nav hidden md:block"
                style={{ backgroundColor: item.thread }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
