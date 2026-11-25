import Link from "next/link";
import { AudioLines, BookOpen, Brain, Headphones, Languages, ListChecks, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PricingCards } from "@/components/pricing-cards";
import { LEVELS, STAGES } from "@/content/curriculum";
import { getI18n } from "@/i18n/server";
import { isPro } from "@/lib/plans";
import { getCurrentUser } from "@/lib/session";

const FEATURE_ICONS = [BookOpen, Languages, Brain, Mic, Headphones, ListChecks];

export default async function LandingPage() {
  const [{ t, locale }, user] = await Promise.all([getI18n(), getCurrentUser()]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-ink text-brand-mist">
        <div
          aria-hidden
          className="absolute -right-32 -top-32 size-[28rem] rounded-full bg-brand-pine opacity-60 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 left-10 size-80 rounded-full bg-brand-lagoon opacity-20 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-[1.2fr_1fr] md:py-28">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-pine bg-brand-pine/40 px-3 py-1 text-xs">
              <AudioLines className="size-3.5 text-brand-lagoon" /> {t.landing.heroKicker}
            </p>
            <h1 className="text-6xl text-brand-mist md:text-8xl">{t.landing.heroTitle}</h1>
            <p className="max-w-xl text-sm leading-relaxed text-brand-mist/80">{t.landing.heroText}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-brand-lagoon text-brand-ink hover:bg-brand-lagoon/90">
                <Link href={user ? "/dashboard" : "/register"}>{t.landing.heroCta}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-brand-pine bg-transparent text-brand-mist hover:bg-brand-pine hover:text-brand-mist"
              >
                <Link href="/pricing">{t.landing.heroSecondary}</Link>
              </Button>
            </div>
          </div>

          {/* Sample tutor exchange */}
          <Card className="self-center border-brand-pine bg-brand-pine/30 text-brand-mist shadow-2xl backdrop-blur">
            <CardContent className="space-y-3 text-sm">
              <ChatBubble side="left">Wie war dein Wochenende?</ChatBubble>
              <ChatBubble side="right">Ich habe nach Hamburg gefahren.</ChatBubble>
              <ChatBubble side="left">
                <span className="text-brand-lagoon">Fast!</span> Mit Bewegungsverben nutzt man <b>sein</b>:{" "}
                <i>Ich bin nach Hamburg gefahren.</i> 🚆
              </ChatBubble>
              <div className="flex items-center gap-2 rounded-lg bg-brand-ink/60 p-3 text-xs">
                <Mic className="size-4 text-brand-lagoon" />
                <span>
                  {locale === "ru" ? "Произношение" : "Pronunciation"}: <b>92/100</b> · ü ✓ · ch ✓ · r ~
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-10 text-center text-6xl text-primary">{t.landing.featuresTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.landing.features.map((f, i) => {
            const Icon = FEATURE_ICONS[i];
            const pro = i >= 3;
            return (
              <Card key={f.title}>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                      <Icon className="size-5" />
                    </div>
                    {pro && <span className="rounded-full bg-pro px-2 py-0.5 text-[10px] text-pro-foreground">Pro</span>}
                  </div>
                  <p className="pt-2 font-semibold">{f.title}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{f.text}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Stages */}
      <section className="bg-secondary/60 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-6xl text-primary">{t.landing.stagesTitle}</h2>
          <p className="mb-10 mt-2 text-center text-sm text-muted-foreground">{t.landing.stagesText}</p>
          <div className="grid gap-4 md:grid-cols-3">
            {STAGES.map((stage, i) => (
              <Card key={stage.id} className={i === 2 ? "bg-brand-ink text-brand-mist" : undefined}>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-4xl">{stage.title[locale]}</h3>
                    {!stage.free && <span className="rounded-full bg-pro px-2 py-0.5 text-[10px] text-pro-foreground">Pro</span>}
                  </div>
                  <p className={i === 2 ? "text-xs text-brand-mist/70" : "text-xs text-muted-foreground"}>
                    {stage.description[locale]}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {LEVELS.filter((l) => l.stage === stage.id).map((l) => (
                      <span
                        key={l.id}
                        className="rounded-md border border-current/20 px-2 py-1 text-xs"
                        title={l.title[locale]}
                      >
                        {l.code}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <h2 className="mb-10 text-center text-6xl text-primary">{t.pricing.title}</h2>
        <PricingCards
          t={t}
          locale={locale}
          signedIn={Boolean(user)}
          pro={isPro(user)}
          hasCustomer={Boolean(user?.stripeCustomerId)}
        />
      </section>

      {/* CTA */}
      <section className="mx-auto mb-20 max-w-6xl px-4">
        <div className="rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground">
          <h2 className="text-5xl">{t.landing.ctaTitle}</h2>
          <p className="mt-2 text-sm opacity-80">{t.landing.ctaText}</p>
          <Button asChild size="lg" className="mt-6 bg-brand-lagoon text-brand-ink hover:bg-brand-lagoon/90">
            <Link href={user ? "/dashboard" : "/register"}>{t.nav.getStarted}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function ChatBubble({ side, children }: { side: "left" | "right"; children: React.ReactNode }) {
  return (
    <div className={side === "right" ? "flex justify-end" : "flex"}>
      <div
        className={
          side === "right"
            ? "max-w-[80%] rounded-2xl rounded-br-sm bg-brand-lagoon px-3 py-2 text-brand-ink"
            : "max-w-[85%] rounded-2xl rounded-bl-sm bg-brand-ink/70 px-3 py-2"
        }
      >
        {children}
      </div>
    </div>
  );
}
