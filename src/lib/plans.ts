import type { Plan } from "@prisma/client";

/** Daily free practice allowance in seconds (default 10 minutes). Override for testing. */
export const FREE_DAILY_SECONDS = Number(process.env.FREE_DAILY_SECONDS ?? 600);
/** Total lessons a Free user can open. */
export const FREE_LESSON_LIMIT = 5;

export type ProFeature =
  | "pronunciation"
  | "speaking"
  | "listening"
  | "mistakes"
  | "allTopics"
  | "unlimitedTime"
  | "unlimitedLessons";

export interface BillingFields {
  plan: Plan;
  subscriptionStatus: string | null;
  currentPeriodEnd: Date | null;
}

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

export function isPro(user: BillingFields | null | undefined): boolean {
  if (!user || user.plan !== "PRO") return false;
  if (user.subscriptionStatus && !ACTIVE_STATUSES.has(user.subscriptionStatus)) return false;
  if (user.currentPeriodEnd && user.currentPeriodEnd.getTime() < Date.now() - 24 * 3600_000) {
    return false;
  }
  return true;
}


export const PRICE_DISPLAY = {
  monthly: { amount: 9.99, currency: "EUR" },
};
