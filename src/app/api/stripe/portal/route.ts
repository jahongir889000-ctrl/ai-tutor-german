import { NextResponse } from "next/server";
import { guarded, HttpError } from "@/lib/api";
import { appUrl, stripe } from "@/lib/stripe";

export const POST = guarded(async (_req, user) => {
  if (!user.stripeCustomerId) throw new HttpError(400, "no_customer");
  const session = await stripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: appUrl("/settings"),
  });
  return NextResponse.json({ url: session.url });
});
