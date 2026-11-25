import { PracticeHeader } from "@/components/practice/practice-header";
import { PronunciationTrainer } from "@/components/practice/pronunciation-trainer";
import { ProGate } from "@/components/pro-gate";
import { PracticeSession } from "@/components/usage/practice-session";
import { getLevel } from "@/content/curriculum";
import { getI18n } from "@/i18n/server";
import { isPro } from "@/lib/plans";
import { requireUser } from "@/lib/session";

export default async function PronunciationPage() {
  const [user, { t, locale }] = await Promise.all([requireUser(), getI18n()]);
  const pro = isPro(user);
  const topic = getLevel(user.currentLevel)?.topics[0] ?? getLevel("a1-1")!.topics[0];
  const initial = {
    phrase: topic.grammar.examples[0],
    translation: `${topic.titleDe} — ${topic.title[locale]}`,
    focus: topic.grammar.title[locale],
  };

  return (
    <div className="space-y-8">
      <PracticeHeader
        title={t.practice.pronunciation.title}
        text={t.practice.pronunciation.text}
        backLabel={t.nav.practice}
        pro
      />
      {pro ? (
        <PracticeSession>
          <PronunciationTrainer initial={initial} />
        </PracticeSession>
      ) : (
        <ProGate t={t} />
      )}
    </div>
  );
}
