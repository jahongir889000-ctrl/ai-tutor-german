import "server-only";
import { db } from "@/lib/db";
import { FREE_DAILY_SECONDS, isPro, type BillingFields } from "@/lib/plans";
import { getNextReset, getUsageWindowStart } from "@/lib/usage-window";

/** Max seconds a single heartbeat can add (client beats every 15s). */
const MAX_BEAT_SECONDS = 20;

export interface UsageStatus {
  unlimited: boolean;
  secondsUsed: number;
  limitSeconds: number;
  remainingSeconds: number;
  nextResetAt: string;
}

type UsageUser = BillingFields & { id: string; timezone: string };

export async function getUsageStatus(user: UsageUser): Promise<UsageStatus> {
  const windowStart = getUsageWindowStart(user.timezone);
  const row = await db.dailyUsage.findUnique({
    where: { userId_windowStart: { userId: user.id, windowStart } },
  });
  return toStatus(user, row?.secondsUsed ?? 0);
}

function toStatus(user: UsageUser, secondsUsed: number): UsageStatus {
  const unlimited = isPro(user);
  return {
    unlimited,
    secondsUsed,
    limitSeconds: FREE_DAILY_SECONDS,
    remainingSeconds: unlimited ? Infinity : Math.max(0, FREE_DAILY_SECONDS - secondsUsed),
    nextResetAt: getNextReset(user.timezone).toISOString(),
  };
}

/** Record active practice time reported by the client. */
export async function recordHeartbeat(user: UsageUser, clientSeconds: number) {
  const now = new Date();
  const windowStart = getUsageWindowStart(user.timezone, now);
  const existing = await db.dailyUsage.findUnique({
    where: { userId_windowStart: { userId: user.id, windowStart } },
  });

  let add = Math.max(0, Math.min(Math.round(clientSeconds) || 0, MAX_BEAT_SECONDS));
  if (existing?.lastBeatAt) {
    const since = (now.getTime() - existing.lastBeatAt.getTime()) / 1000;
    add = Math.min(add, Math.ceil(since) + 2);
  }

  const row = await db.dailyUsage.upsert({
    where: { userId_windowStart: { userId: user.id, windowStart } },
    create: { userId: user.id, windowStart, secondsUsed: add, lastBeatAt: now },
    update: { secondsUsed: { increment: add }, lastBeatAt: now },
  });
  return toStatus(user, row.secondsUsed);
}

/** Days in a row (by practice window) with any practice. */
export async function getStreak(user: UsageUser): Promise<number> {
  const rows = await db.dailyUsage.findMany({
    where: { userId: user.id, secondsUsed: { gt: 0 } },
    orderBy: { windowStart: "desc" },
    take: 60,
    select: { windowStart: true },
  });
  if (!rows.length) return 0;
  const DAY = 24 * 3600_000;
  let cursor = getUsageWindowStart(user.timezone).getTime();
  let streak = 0;
  for (const r of rows) {
    const t = r.windowStart.getTime();
    // allow ±2h drift for DST
    if (Math.abs(t - cursor) < 2 * 3600_000) {
      streak++;
      cursor -= DAY;
    } else if (streak === 0 && Math.abs(t - (cursor - DAY)) < 2 * 3600_000) {
      // today not practiced yet: count from yesterday
      streak++;
      cursor -= 2 * DAY;
    } else {
      break;
    }
  }
  return streak;
}
