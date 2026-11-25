import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, Brain, Flame, Headphones, Languages, MessageCircle, Mic, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckoutToast } from "@/components/checkout-toast";
import { ProBadge } from "@/components/pro-gate";
import { ALL_TOPICS, STAGES, getLevel, getTopic, levelsOfStage } from "@/content/curriculum";
import { getI18n } from "@/i18n/server";
import { fmt } from "@/i18n";
import { db } from "@/lib/db";
import { formatDuration, msUntil } from "@/lib/format";
import { getProgressMap } from "@/lib/lessons";
import { FREE_LESSON_LIMIT, isPro } from "@/lib/plans";
import { requireUser } from "@/lib/session";
import { getStreak, getUsageStatus } from "@/lib/usage";

export default async function DashboardPage() {
  const [user, { t, locale }] = await Promise.all([requireUser(), getI18n()]);
  const pro = isPro(user);
  const [usage, streak, progress, mistakes] = await Promise.all([
    getUsageStatus(user),
    getStreak(user),
    getProgressMap(user.id),
    db.mistake.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  const level = getLevel(user.currentLevel) ?? getLevel("a1-1")!;
  const inProgress = [...progress.values()]
    .filter((p) => p.status === "IN_PROGRESS")
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0];
  const continueTopic = inProgress
    ? getTopic(inProgress.topicId)
    : level.topics.find((tp) => !progress.has(tp.id)) ?? level.topics[0];
  const lessonsUsed = progress.size;
  const remainingMs = (usage.remainingSeconds === Infinity ? 0 : usage.remainingSeconds) * 1000;
  const resetIn = msUntil(usage.nextResetAt);

  const quick = [
    { href: "/practice/chat", icon: MessageCircle, label: t.practice.chat.title, pro: false },
    { href: "/practice/quiz", icon: Brain, label: t.practice.quiz.title, pro: false },
    { href: "/practice/vocab", icon: Languages, label: t.practice.vocab.title, pro: false },
    { href: "/practice/pronunciation", icon: Mic, label: t.practice.pronunciation.title, pro: true },
    { href: "/practice/listening", icon: Headphones, label: t.practice.listening.title, pro: true },
  ];

  return (
    <div className="space-y-8">
      <Suspense>
        <CheckoutToast />
      </Suspense>
      <h1 className="text-6xl text-primary">{fmt(t.dashboard.hello, { name: user.name?.split(" ")[0] || "" })}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label={t.dashboard.level}>
          <span className="text-2xl font-bold">{level.code}</span>
          <span className="text-xs text-muted-foreground">{level.title[locale]}</span>
        </StatCard>
        <StatCard icon={Flame} label={t.dashboard.streak}>
          <span className="text-2xl font-bold">
            {streak} <span className="text-sm font-normal">{t.dashboard.days}</span>
          </span>
        </StatCard>
        <StatCard icon={Timer} label={t.dashboard.today}>
          {usage.unlimited ? (
            <span className="text-2xl font-bold">{t.dashboard.unlimited}</span>
          ) : (
            <>
              <span className="text-2xl font-bold">{fmt(t.usage.left, { min: Math.ceil(remainingMs / 60000) })}</span>
              <Progress value={(remainingMs / 1000 / usage.limitSeconds) * 100} className="h-1.5" />
              <span className="text-xs text-muted-foreground">
                {fmt(t.usage.reset, { time: formatDuration(resetIn, locale) })}
              </span>
            </>
          )}
        </StatCard>
        <StatCard icon={BookOpen} label={t.dashboard.lessons}>
          <span className="text-2xl font-bold">
            {pro ? lessonsUsed : fmt(t.dashboard.lessonsOf, { used: lessonsUsed, limit: FREE_LESSON_LIMIT })}
          </span>
          {!pro && <Progress value={(lessonsUsed / FREE_LESSON_LIMIT) * 100} className="h-1.5" />}
        </StatCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {continueTopic && (
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="flex h-full flex-col justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-wide opacity-70">
                  {getLevel(continueTopic.levelId)?.code} · {continueTopic.title[locale]}
                </p>
                <p lang="de" className="font-heading text-5xl">
                  {continueTopic.titleDe}
                </p>
                <p className="mt-2 text-sm opacity-80">
                  {t.learn.grammar}: {continueTopic.grammar.title[locale]}
                </p>
              </div>
              <Button asChild className="w-fit bg-brand-lagoon text-brand-ink hover:bg-brand-lagoon/90">
                <Link href={`/learn/${continueTopic.levelId}/${continueTopic.id}`}>{t.dashboard.continue}</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.dashboard.quick}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {quick.map(({ href, icon: Icon, label, pro: needsPro }) => (
              <Button key={href} asChild variant="outline" className="justify-start">
                <Link href={href}>
                  <Icon /> {label}
                  {needsPro && !pro && <ProBadge className="ml-auto" />}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.dashboard.progress}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {STAGES.map((stage) => {
              const topics = levelsOfStage(stage.id).flatMap((l) => l.topics);
              const done = topics.filter((tp) => progress.get(tp.id)?.status === "COMPLETED").length;
              return (
                <div key={stage.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {stage.title[locale]} {!stage.free && !pro && <ProBadge />}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {done}/{topics.length} {t.dashboard.completed}
                    </span>
                  </div>
                  <Progress value={(done / topics.length) * 100} />
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">
              {[...progress.values()].filter((p) => p.status === "COMPLETED").length}/{ALL_TOPICS.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t.dashboard.recentMistakes}</CardTitle>
            <Button asChild variant="link" size="sm">
              <Link href="/mistakes">{t.nav.mistakes}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {mistakes.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.dashboard.noMistakes}</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {mistakes.map((m) => (
                  <li key={m.id}>
                    <s className="text-destructive">{m.original}</s> → <b lang="de">{m.correction}</b>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="py-5">
      <CardContent className="flex flex-col gap-1.5 px-5">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="size-3.5" /> {label}
        </span>
        {children}
      </CardContent>
    </Card>
  );
}
