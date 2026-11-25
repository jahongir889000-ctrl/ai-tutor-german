import { Suspense } from "react";
import { PricingCards } from "@/components/pricing-cards";
import { CheckoutToast } from "@/components/checkout-toast";
import { getI18n } from "@/i18n/server";
import { isPro } from "@/lib/plans";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Тарифы" };

export default async function PricingPage() {
  const [{ t, locale }, user] = await Promise.all([getI18n(), getCurrentUser()]);
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <Suspense>
        <CheckoutToast />
      </Suspense>
      <div className="mb-10 text-center">
        <h1 className="text-7xl text-primary">{t.pricing.title}</h1>
        <p className="mt-3 text-muted-foreground">{t.pricing.subtitle}</p>
      </div>
      <PricingCards
        t={t}
        locale={locale}
        signedIn={Boolean(user)}
        pro={isPro(user)}
        hasCustomer={Boolean(user?.stripeCustomerId)}
      />
      <p className="mt-8 text-center text-xs text-muted-foreground">{t.pricing.resetNote}</p>
    </div>
  );
}
