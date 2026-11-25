"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { UsageDTO } from "@/lib/format";

interface UsageContextValue {
  usage: UsageDTO;
  blocked: boolean;
  setUsage: (u: UsageDTO) => void;
  /** Call when an API returns 429 daily_limit. */
  markExhausted: () => void;
}

const UsageContext = createContext<UsageContextValue | null>(null);

export function UsageProvider({ initial, children }: { initial: UsageDTO; children: ReactNode }) {
  const [usage, setUsage] = useState(initial);

  // When the reset time passes, refetch the fresh window.
  useEffect(() => {
    const ms = new Date(usage.nextResetAt).getTime() - Date.now();
    if (ms <= 0 || ms > 2 ** 31 - 1) return;
    const id = setTimeout(async () => {
      const res = await fetch("/api/usage");
      if (res.ok) setUsage(await res.json());
    }, ms + 1000);
    return () => clearTimeout(id);
  }, [usage.nextResetAt]);

  const markExhausted = useCallback(
    () => setUsage((u) => ({ ...u, remainingSeconds: 0, secondsUsed: u.limitSeconds })),
    [],
  );

  const blocked = !usage.unlimited && (usage.remainingSeconds ?? 0) <= 0;

  return (
    <UsageContext.Provider value={{ usage, blocked, setUsage, markExhausted }}>
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  const ctx = useContext(UsageContext);
  if (!ctx) throw new Error("useUsage must be used within UsageProvider");
  return ctx;
}
