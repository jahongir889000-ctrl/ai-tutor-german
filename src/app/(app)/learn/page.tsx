import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProBadge } from "@/components/pro-gate";
import { STAGES, levelsOfStage } from "@/content/curriculum";
import { getI18n } from "@/i18n/server";
import { fmt } from "@/i18n";
import { getLessonsUsed, getProgressMap } from "@/lib/lessons";
import { FREE_LESSON_LIMIT, isPro } from "@/lib/plans";
import { requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function LearnPage() {
  const [user, { t, locale }] = await Promise.all([requireUser(), getI18n()]);
  const pro = isPro(user);
  const [progress, used] = await Promise.all([getProgressMap(user.id), getLessonsUsed(user.id)]);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-6xl text-primary">{t.learn.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.learn.text}</p>
        </div>
        {!pro && (
          <p className="rounded-full bg-secondary px-3 py-1 text-xs">
            {fmt(t.learn.lessonsLeft, { n: Math.max(0, FREE_LESSON_LIMIT - used), limit: FREE_LESSON_LIMIT })}
          </p>
        )}
      </div>

      {STAGES.map((stage) => {
        const locked = !pro && !stage.free;
        return (
          <section key={stage.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-5xl">{stage.title[locale]}</h2>
              {locked && <ProBadge />}
              <span className="text-xs text-muted-foreground">{stage.description[locale]}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {levelsOfStage(stage.id).map((level) => {
                const done = level.topics.filter((tp) => progress.get(tp.id)?.status === "COMPLETED").length;
                const current = user.currentLevel === level.id;
                return (
                  <Link key={level.id} href={`/learn/${level.id}`} className="group">
                    <Card
                      className={cn(
                        "h-full transition-shadow group-hover:shadow-md",
                        current && "border-primary ring-2 ring-ring/40",
                        locked && "opacity-70",
                      )}
                    >
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                            {level.code}
                          </span>
                          {locked ? (
                            <Lock className="size-4 text-pro" />
                          ) : done === level.topics.length ? (
                            <CheckCircle2 className="size-4 text-brand-lagoon" />
                          ) : null}
                        </div>
                        <p className="font-semibold">{level.title[locale]}</p>
                        <p className="text-xs text-muted-foreground">{level.description[locale]}</p>
                        <div className="space-y-1">
                          <Progress value={(done / level.topics.length) * 100} className="h-1.5" />
                          <p className="text-[11px] text-muted-foreground">
                            {done}/{level.topics.length} {t.learn.topics}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
