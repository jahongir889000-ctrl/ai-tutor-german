import { PracticeHeader } from "@/components/practice/practice-header";
import { QuizPlayer } from "@/components/practice/quiz-player";
import { TopicPicker } from "@/components/practice/topic-picker";
import { PracticeSession } from "@/components/usage/practice-session";
import { getI18n } from "@/i18n/server";
import { practiceTopics } from "@/lib/practice";
import { requireUser } from "@/lib/session";

export default async function QuizPage({ searchParams }: PageProps<"/practice/quiz">) {
  const [user, { t, locale }, sp] = await Promise.all([requireUser(), getI18n(), searchParams]);
  const { options, selected } = practiceTopics(user, locale, sp.topic);

  return (
    <PracticeSession>
      <div className="mx-auto max-w-3xl space-y-6">
        <PracticeHeader title={t.practice.quiz.title} text={t.practice.quiz.text} backLabel={t.nav.practice}>
          <TopicPicker options={options} value={selected} />
        </PracticeHeader>
        <QuizPlayer key={selected} topicId={selected} />
      </div>
    </PracticeSession>
  );
}
