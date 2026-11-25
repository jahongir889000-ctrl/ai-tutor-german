import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompleteLessonButton, StartLessonButton } from "@/components/lesson-actions";
import { ProGate } from "@/components/pro-gate";
import { SpeakButton } from "@/components/speak-button";
import { GrammarDeepDive } from "@/components/practice/grammar-deep-dive";
import { QuizPlayer } from "@/components/practice/quiz-player";
import { SaveWordButton } from "@/components/practice/vocab-explorer";
import { WritingTask } from "@/components/practice/writing-task";
import { PracticeSession } from "@/components/usage/practice-session";
import { getLevel, getTopic } from "@/content/curriculum";
import { getI18n } from "@/i18n/server";
import { fmt } from "@/i18n";
import { getLessonAccess, getLessonsUsed } from "@/lib/lessons";
import { FREE_LESSON_LIMIT, isPro } from "@/lib/plans";
import { requireUser } from "@/lib/session";

export default async function TopicPage({ params }: PageProps<"/learn/[level]/[topic]">) {
  const { level: levelId, topic: topicId } = await params;
  const level = getLevel(levelId);
  const topic = getTopic(topicId);
  if (!level || !topic || topic.levelId !== level.id) notFound();

  const [user, { t, locale }] = await Promise.all([requireUser(), getI18n()]);
  const access = await getLessonAccess(user, topic);

  const header = (
    <div className="space-y-2">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/learn/${level.id}`}>
          <ArrowLeft /> {level.code} · {level.title[locale]}
        </Link>
      </Button>
      <h1 lang="de" className="text-6xl text-primary">
        {topic.titleDe}
      </h1>
      <p className="text-muted-foreground">{topic.title[locale]}</p>
    </div>
  );

  if (!access.allowed) {
    return (
      <div className="space-y-8">
        {header}
        <ProGate t={t} title={access.reason === "limit" ? t.learn.lockedLimit : t.learn.lockedPro} text={t.learn.lockedText} />
      </div>
    );
  }

  if (!access.progress) {
    const used = await getLessonsUsed(user.id);
    return (
      <div className="space-y-8">
        {header}
        <Card className="max-w-xl">
          <CardContent className="space-y-4">
            <p className="text-sm">
              {t.learn.grammar}: <b>{topic.grammar.title[locale]}</b>
            </p>
            <p className="text-sm">
              {t.learn.vocab}: {topic.words.map((w) => w.de).join(", ")}
            </p>
            {!isPro(user) && (
              <p className="text-xs text-muted-foreground">
                {fmt(t.learn.lessonsLeft, { n: FREE_LESSON_LIMIT - used, limit: FREE_LESSON_LIMIT })}
              </p>
            )}
            <StartLessonButton topicId={topic.id} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PracticeSession>
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          {header}
          <CompleteLessonButton topicId={topic.id} completed={access.progress.status === "COMPLETED"} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="size-4" /> {t.learn.grammar}: {topic.grammar.title[locale]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="leading-relaxed">{topic.grammar.rule[locale]}</p>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">{t.learn.examples}</p>
                <ul className="space-y-1">
                  {topic.grammar.examples.map((ex) => (
                    <li key={ex} className="flex items-center gap-1">
                      <SpeakButton text={ex} />
                      <span lang="de">{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <GrammarDeepDive topicId={topic.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Languages className="size-4" /> {t.learn.vocab}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y text-sm">
                {topic.words.map((w) => (
                  <li key={w.de} className="flex items-center gap-1 py-1.5">
                    <SpeakButton text={w.de} />
                    <span lang="de" className="font-medium">
                      {w.de}
                    </span>
                    <span className="flex-1 text-muted-foreground">— {w[locale]}</span>
                    <SaveWordButton word={{ de: w.de, translation: w[locale] }} topicId={topic.id} />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-4">
          <h2 className="text-5xl">{t.learn.exercises}</h2>
          <Tabs defaultValue="quiz">
            <TabsList>
              <TabsTrigger value="quiz">{t.learn.quiz}</TabsTrigger>
              <TabsTrigger value="task">{t.learn.task.split(":")[0]}</TabsTrigger>
            </TabsList>
            <TabsContent value="quiz" className="pt-4">
              <QuizPlayer topicId={topic.id} />
            </TabsContent>
            <TabsContent value="task" className="pt-4">
              <WritingTask topicId={topic.id} />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </PracticeSession>
  );
}
