import { NextResponse } from "next/server";
import { guarded, HttpError } from "@/lib/api";
import { db } from "@/lib/db";
import { isPro } from "@/lib/plans";
import { appUrl, stripe } from "@/lib/stripe";

export const POST = guarded(async (_req, user) => {
  if (isPro(user)) throw new HttpError(409, "already_pro");
  const price = process.env.STRIPE_PRO_PRICE_ID;
  if (!price) throw new HttpError(500, "stripe_not_configured", "STRIPE_PRO_PRICE_ID is not set");

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe().customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    subscription_data: { metadata: { userId: user.id } },
    locale: user.locale === "en" ? "en" : "ru",
    success_url: appUrl("/dashboard?checkout=success"),
    cancel_url: appUrl("/pricing?checkout=canceled"),
  });

  return NextResponse.json({ url: session.url });
});
