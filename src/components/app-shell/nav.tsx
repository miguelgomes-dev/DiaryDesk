"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CalendarCheck,
  Wallet,
  Heart,
  GraduationCap,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

const NAV_ITEMS: { href: string; label: string; thread: string; icon: LucideIcon }[] = [
  { href: "/", label: "Dashboard", thread: "var(--foreground)", icon: LayoutGrid },
  { href: "/tarefas", label: "Tarefas", thread: "var(--accent)", icon: CalendarCheck },
  { href: "/financeiro", label: "Financeiro", thread: "var(--thread-casa)", icon: Wallet },
  { href: "/saude", label: "Saúde", thread: "var(--thread-saude)", icon: Heart },
  { href: "/faculdade", label: "Faculdade", thread: "var(--thread-faculdade)", icon: GraduationCap },
  { href: "/trabalho", label: "Trabalho", thread: "var(--thread-trabalho)", icon: Briefcase },
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
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors md:rounded-none md:pl-4 md:pr-5 ${
              active
                ? "bg-foreground/[0.04] text-foreground"
                : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            <Icon
              aria-hidden
              className="h-[15px] w-[15px] shrink-0"
              strokeWidth={2}
              style={active ? { color: item.thread } : { opacity: 0.62 }}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
