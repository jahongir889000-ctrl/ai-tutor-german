import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MistakesAnalyzer } from "@/components/practice/mistakes-analyzer";
import { ProBadge, ProGate } from "@/components/pro-gate";
import { getI18n } from "@/i18n/server";
import { db } from "@/lib/db";
import { isPro } from "@/lib/plans";
import { requireUser } from "@/lib/session";

export default async function MistakesPage() {
  const [user, { t, locale }] = await Promise.all([requireUser(), getI18n()]);
  const pro = isPro(user);
  const mistakes = await db.mistake.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: pro ? 100 : 5,
  });
  const total = pro ? mistakes.length : await db.mistake.count({ where: { userId: user.id } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-3 text-6xl text-primary">
          {t.mistakes.title} <ProBadge className="font-sans" />
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.mistakes.text}</p>
      </div>

      {pro ? mistakes.length > 0 && <MistakesAnalyzer /> : <ProGate t={t} />}

      {mistakes.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.mistakes.empty}</p>
      ) : (
        <div className="space-y-2">
          {!pro && (
            <p className="text-xs text-muted-foreground">
              {mistakes.length} / {total}
            </p>
          )}
          {mistakes.map((m) => (
            <Card key={m.id} className="py-3">
              <CardContent className="flex flex-col gap-1 px-4 text-sm sm:flex-row sm:items-center sm:gap-4">
                <Badge variant="outline" className="w-fit shrink-0">
                  {t.mistakes.types[m.type]}
                </Badge>
                <div className="flex-1">
                  <p>
                    <s className="text-destructive">{m.original}</s> → <b lang="de">{m.correction}</b>
                  </p>
                  {pro && <p className="text-xs text-muted-foreground">{m.explanation}</p>}
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {m.createdAt.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-GB")}
                </time>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
