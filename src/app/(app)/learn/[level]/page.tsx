import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, CircleDot, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProBadge } from "@/components/pro-gate";
import { getLevel, getStage, isBasicLevel } from "@/content/curriculum";
import { getI18n } from "@/i18n/server";
import { getProgressMap } from "@/lib/lessons";
import { isPro } from "@/lib/plans";
import { requireUser } from "@/lib/session";

export default async function LevelPage({ params }: PageProps<"/learn/[level]">) {
  const { level: levelId } = await params;
  const level = getLevel(levelId);
  if (!level) notFound();

  const [user, { t, locale }] = await Promise.all([requireUser(), getI18n()]);
  const locked = !isPro(user) && !isBasicLevel(level);
  const progress = await getProgressMap(user.id);

  return (
    <div className="space-y-8">
      <Button asChild variant="ghost" size="sm">
        <Link href="/learn">
          <ArrowLeft /> {t.nav.learn}
        </Link>
      </Button>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {getStage(level.stage).title[locale]} · {level.code}
        </p>
        <h1 className="flex items-center gap-3 text-6xl text-primary">
          {level.title[locale]} {locked && <ProBadge className="font-sans" />}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{level.description[locale]}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {level.topics.map((topic, i) => {
          const p = progress.get(topic.id);
          return (
            <Link key={topic.id} href={`/learn/${level.id}/${topic.id}`} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {level.code} · {i + 1}
                    </span>
                    {locked ? (
                      <Lock className="size-4 text-pro" />
                    ) : p?.status === "COMPLETED" ? (
                      <span className="flex items-center gap-1 text-brand-pine dark:text-brand-lagoon">
                        <CheckCircle2 className="size-4" /> {t.learn.completed}
                      </span>
                    ) : p ? (
                      <CircleDot className="size-4 text-primary" />
                    ) : null}
                  </div>
                  <p lang="de" className="font-heading text-3xl">
                    {topic.titleDe}
                  </p>
                  <p className="text-sm">{topic.title[locale]}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.learn.grammar}: {topic.grammar.title[locale]}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
