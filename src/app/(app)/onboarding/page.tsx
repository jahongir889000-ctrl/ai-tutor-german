import { ProfileForm } from "@/components/profile-form";
import { getI18n } from "@/i18n/server";
import { isPro } from "@/lib/plans";
import { requireUser } from "@/lib/session";

export default async function OnboardingPage() {
  const [user, { t, locale }] = await Promise.all([requireUser({ allowNotOnboarded: true }), getI18n()]);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-6xl text-primary">{t.onboarding.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.onboarding.text}</p>
      </div>
      <ProfileForm
        mode="onboarding"
        pro={isPro(user)}
        defaults={{ name: user.name ?? "", level: user.currentLevel, timezone: user.timezone, locale }}
      />
    </div>
  );
}
