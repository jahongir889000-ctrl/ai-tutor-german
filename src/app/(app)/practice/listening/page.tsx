import { ListeningExercise } from "@/components/practice/listening-exercise";
import { PracticeHeader } from "@/components/practice/practice-header";
import { TopicPicker } from "@/components/practice/topic-picker";
import { ProGate } from "@/components/pro-gate";
import { PracticeSession } from "@/components/usage/practice-session";
import { getI18n } from "@/i18n/server";
import { isPro } from "@/lib/plans";
import { practiceTopics } from "@/lib/practice";
import { requireUser } from "@/lib/session";

export default async function ListeningPage({ searchParams }: PageProps<"/practice/listening">) {
  const [user, { t, locale }, sp] = await Promise.all([requireUser(), getI18n(), searchParams]);
  const pro = isPro(user);
  const { options, selected } = practiceTopics(user, locale, sp.topic);

  return (
    <div className="space-y-8">
      <PracticeHeader title={t.practice.listening.title} text={t.practice.listening.text} backLabel={t.nav.practice} pro>
        {pro && <TopicPicker options={options} value={selected} />}
      </PracticeHeader>
      {pro ? (
        <PracticeSession>
          <ListeningExercise key={selected} topicId={selected} />
        </PracticeSession>
      ) : (
        <ProGate t={t} />
      )}
    </div>
  );
}
