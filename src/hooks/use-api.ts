"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUsage } from "@/components/usage/usage-provider";
import { useI18n } from "@/i18n/client";

/**
 * fetch wrapper for our API: handles the daily limit (429), Pro gating (402) and errors.
 * Returns the Response on success, or null after surfacing the problem to the user.
 */
export function useApi() {
  const { markExhausted } = useUsage();
  const { t } = useI18n();
  const router = useRouter();

  const request = useCallback(
    async (url: string, init?: RequestInit): Promise<Response | null> => {
      let res: Response;
      try {
        res = await fetch(url, init);
      } catch {
        toast.error(t.common.error);
        return null;
      }
      if (res.ok) return res;
      const data = await res.json().catch(() => ({}));
      if (res.status === 429 && data.error === "daily_limit") {
        markExhausted();
      } else if (res.status === 402) {
        toast(t.proGate.title, { action: { label: t.proGate.cta, onClick: () => router.push("/pricing") } });
      } else if (res.status === 401) {
        router.push("/login");
      } else {
        toast.error(data.message ?? t.common.error);
      }
      return null;
    },
    [markExhausted, router, t],
  );

  const json = useCallback(
    async <T,>(url: string, body?: unknown, method = "POST"): Promise<T | null> => {
      const res = await request(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      return res ? ((await res.json()) as T) : null;
    },
    [request],
  );

  return { request, json };
}
