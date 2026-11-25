"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useUsage } from "./usage-provider";
import { LimitDialog } from "./limit-dialog";

const BEAT_SECONDS = 15;
const IDLE_AFTER_MS = 90_000;

/**
 * Wrap any practice surface (lessons, quizzes, chat…). While the tab is visible and the
 * learner is active, it reports practice time to the server every 15 seconds. When the
 * free daily allowance is used up it locks the content and shows the limit dialog.
 */
export function PracticeSession({ children }: { children: ReactNode }) {
  const { blocked, setUsage } = useUsage();
  const lastActivity = useRef(0);

  useEffect(() => {
    const touch = () => (lastActivity.current = Date.now());
    touch();
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, touch));
  }, []);

  useEffect(() => {
    if (blocked) return;
    const id = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastActivity.current > IDLE_AFTER_MS) return;
      try {
        const res = await fetch("/api/usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seconds: BEAT_SECONDS }),
        });
        if (res.ok) setUsage(await res.json());
      } catch {
        /* offline: skip this beat */
      }
    }, BEAT_SECONDS * 1000);
    return () => clearInterval(id);
  }, [blocked, setUsage]);

  return (
    <>
      <div aria-disabled={blocked} className={blocked ? "pointer-events-none select-none opacity-40" : undefined}>
        {children}
      </div>
      <LimitDialog open={blocked} />
    </>
  );
}
