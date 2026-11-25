import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingPortalButton, UpgradeButton } from "@/components/billing-buttons";
import type { Dict } from "@/i18n";
import { PRICE_DISPLAY } from "@/lib/plans";

interface Props {
  t: Dict;
  locale: "ru" | "en";
  signedIn: boolean;
  pro: boolean;
  hasCustomer: boolean;
}

export function PricingCards({ t, locale, signedIn, pro, hasCustomer }: Props) {
  const price = new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    style: "currency",
    currency: PRICE_DISPLAY.monthly.currency,
  }).format(PRICE_DISPLAY.monthly.amount);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <h3 className="text-4xl">{t.pricing.freeName}</h3>
            {signedIn && !pro && <Badge variant="secondary">{t.pricing.currentPlan}</Badge>}
          </CardTitle>
          <CardDescription>{t.pricing.freeText}</CardDescription>
          <p className="pt-2 text-3xl font-bold">
            0 € <span className="text-sm font-normal text-muted-foreground">{t.pricing.perMonth}</span>
          </p>
        </CardHeader>
        <CardContent className="flex-1">
          <FeatureList items={t.pricing.freeFeatures} />
        </CardContent>
        <CardFooter>
          {!signedIn && (
            <Button asChild variant="outline" className="w-full">
              <Link href="/register">{t.pricing.startFree}</Link>
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card className="relative flex flex-col border-2 border-pro">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <h3 className="text-4xl text-pro">{t.pricing.proName}</h3>
            {pro && <Badge className="bg-pro text-pro-foreground">{t.pricing.currentPlan}</Badge>}
          </CardTitle>
          <CardDescription>{t.pricing.proText}</CardDescription>
          <p className="pt-2 text-3xl font-bold">
            {price} <span className="text-sm font-normal text-muted-foreground">{t.pricing.perMonth}</span>
          </p>
        </CardHeader>
        <CardContent className="flex-1">
          <FeatureList items={t.pricing.proFeatures} accent />
        </CardContent>
        <CardFooter>
          {pro && hasCustomer ? (
            <BillingPortalButton label={t.pricing.manage} className="w-full" />
          ) : signedIn ? (
            <UpgradeButton className="w-full" />
          ) : (
            <Button asChild className="w-full bg-pro text-pro-foreground hover:bg-pro/90">
              <Link href="/register">{t.pricing.upgrade}</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

function FeatureList({ items, accent }: { items: string[]; accent?: boolean }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((f) => (
        <li key={f} className="flex gap-2">
          <Check className={accent ? "mt-0.5 size-4 shrink-0 text-pro" : "mt-0.5 size-4 shrink-0 text-brand-lagoon"} />
          {f}
        </li>
      ))}
    </ul>
  );
}
