"use client";

import { useEffect, useState } from "react";

/** Current timestamp, refreshed every `intervalMs`. Returns 0 on the server render. */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [intervalMs]);
  return now;
}
