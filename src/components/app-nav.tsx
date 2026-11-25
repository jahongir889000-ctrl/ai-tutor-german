"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Dumbbell, Home, ListChecks } from "lucide-react";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

export function AppNav({ className }: { className?: string }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const items = [
    { href: "/dashboard", label: t.nav.dashboard, icon: Home },
    { href: "/learn", label: t.nav.learn, icon: BookOpen },
    { href: "/practice", label: t.nav.practice, icon: Dumbbell },
    { href: "/mistakes", label: t.nav.mistakes, icon: ListChecks },
  ];
  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
              active && "bg-secondary text-secondary-foreground",
            )}
          >
            <Icon className="size-4" />
            <span className="hidden md:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
