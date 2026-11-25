import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PracticeHeader } from "@/components/practice/practice-header";
import { TopicPicker } from "@/components/practice/topic-picker";
import { VocabExplorer } from "@/components/practice/vocab-explorer";
import { SpeakButton } from "@/components/speak-button";
import { PracticeSession } from "@/components/usage/practice-session";
import { getI18n } from "@/i18n/server";
import { db } from "@/lib/db";
import { practiceTopics } from "@/lib/practice";
import { requireUser } from "@/lib/session";

export default async function VocabPage({ searchParams }: PageProps<"/practice/vocab">) {
  const [user, { t, locale }, sp] = await Promise.all([requireUser(), getI18n(), searchParams]);
  const { options, selected } = practiceTopics(user, locale, sp.topic);
  const saved = await db.vocabItem.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <PracticeSession>
      <div className="space-y-8">
        <PracticeHeader title={t.practice.vocab.title} text={t.practice.vocab.text} backLabel={t.nav.practice}>
          <TopicPicker options={options} value={selected} />
        </PracticeHeader>
        <VocabExplorer key={selected} topicId={selected} />
        {saved.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t.practice.myVocab} ({saved.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-x-6 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {saved.map((w) => (
                  <li key={w.id} className="flex items-center gap-1 border-b py-1">
                    <SpeakButton text={w.de} />
                    <span lang="de" className="font-medium">
                      {w.de}
                    </span>
                    <span className="truncate text-muted-foreground">— {w.translation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </PracticeSession>
  );
}
