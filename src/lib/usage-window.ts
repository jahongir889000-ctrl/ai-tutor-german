import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

/** Hour (local, 24h) at which the free daily allowance resets. */
export const RESET_HOUR = 12;

export function safeTimeZone(tz: string | null | undefined): string {
  if (!tz) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

function shiftYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function noonOf(ymd: string, tz: string): Date {
  const hh = String(RESET_HOUR).padStart(2, "0");
  return fromZonedTime(`${ymd}T${hh}:00:00`, tz);
}

/**
 * Start of the current "practice day": the most recent 12:00 in the user's timezone.
 * Before noon this is yesterday's noon; from noon on it is today's noon.
 */
export function getUsageWindowStart(timeZone: string, now: Date = new Date()): Date {
  const tz = safeTimeZone(timeZone);
  const ymd = formatInTimeZone(now, tz, "yyyy-MM-dd");
  const todayNoon = noonOf(ymd, tz);
  return now.getTime() >= todayNoon.getTime() ? todayNoon : noonOf(shiftYmd(ymd, -1), tz);
}

/** The next moment the allowance resets (next 12:00 in the user's timezone). */
export function getNextReset(timeZone: string, now: Date = new Date()): Date {
  const tz = safeTimeZone(timeZone);
  const ymd = formatInTimeZone(now, tz, "yyyy-MM-dd");
  const todayNoon = noonOf(ymd, tz);
  return now.getTime() < todayNoon.getTime() ? todayNoon : noonOf(shiftYmd(ymd, 1), tz);
}
