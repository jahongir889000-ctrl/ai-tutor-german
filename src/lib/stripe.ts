import "server-only";
import Stripe from "stripe";
import { db } from "@/lib/db";

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

/** Public origin of the app: explicit NEXT_PUBLIC_APP_URL, else Vercel's production domain, else localhost. */
export function appUrl(path = "") {
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    "http://localhost:3000";
  return origin.replace(/\/$/, "") + path;
}

const PRO_STATUSES = new Set(["active", "trialing", "past_due"]);

/** Mirror a Stripe subscription onto the user row. */
export async function syncSubscription(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const userId = sub.metadata?.userId;
  const periodEnd = sub.items.data.reduce(
    (max, item) => Math.max(max, item.current_period_end ?? 0),
    0,
  );
  const active = PRO_STATUSES.has(sub.status);

  const where = userId ? { id: userId } : { stripeCustomerId: customerId };
  await db.user.updateMany({
    where,
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: active ? sub.id : null,
      subscriptionStatus: sub.status,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      plan: active ? "PRO" : "FREE",
    },
  });
}
