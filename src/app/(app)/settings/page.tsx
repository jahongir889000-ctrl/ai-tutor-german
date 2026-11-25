import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile-form";
import { BillingPortalButton } from "@/components/billing-buttons";
import { getI18n } from "@/i18n/server";
import { fmt } from "@/i18n";
import { isPro } from "@/lib/plans";
import { requireUser } from "@/lib/session";

export default async function SettingsPage() {
  const [user, { t, locale }] = await Promise.all([requireUser(), getI18n()]);
  const pro = isPro(user);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h1 className="text-6xl text-primary">{t.settings.title}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.settings.subscription}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              {t.settings.plan}:
              <Badge className={pro ? "bg-pro text-pro-foreground" : ""} variant={pro ? "default" : "secondary"}>
                {pro ? "Pro" : "Free"}
              </Badge>
            </div>
            {pro && user.currentPeriodEnd && (
              <p className="text-xs text-muted-foreground">
                {fmt(t.settings.renews, {
                  date: user.currentPeriodEnd.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-GB"),
                })}
              </p>
            )}
          </div>
          {user.stripeCustomerId ? (
            <BillingPortalButton label={t.settings.manage} />
          ) : (
            <Button asChild className="bg-pro text-pro-foreground hover:bg-pro/90">
              <Link href="/pricing">{t.settings.upgrade}</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.settings.profile}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            mode="settings"
            pro={pro}
            defaults={{ name: user.name ?? "", level: user.currentLevel, timezone: user.timezone, locale }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
