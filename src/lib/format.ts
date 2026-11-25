import type { Locale } from "@/content/curriculum";

export function formatDuration(ms: number, locale: Locale): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const u = locale === "ru" ? { h: "ч", m: "мин", s: "с" } : { h: "h", m: "min", s: "s" };
  if (h > 0) return `${h} ${u.h} ${m} ${u.m}`;
  if (m > 0) return `${m} ${u.m}`;
  return `${s} ${u.s}`;
}

/** Milliseconds from now until the given ISO date. */
export function msUntil(iso: string): number {
  return new Date(iso).getTime() - Date.now();
}

export interface UsageDTO {
  unlimited: boolean;
  secondsUsed: number;
  limitSeconds: number;
  remainingSeconds: number | null;
  nextResetAt: string;
}
