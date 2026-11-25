"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { SpeakButton } from "@/components/speak-button";
import { useApi } from "@/hooks/use-api";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n";
import type { Quiz } from "@/lib/ai/schemas";
import { cn } from "@/lib/utils";

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/ae/g, "ä")
    .replace(/oe/g, "ö")
    .replace(/ue/g, "ü")
    .replace(/ss/g, "ß")
    .replace(/[.,!?;:"„“«»]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function QuizPlayer({ topicId, onFinished }: { topicId?: string | null; onFinished?: (score: number, total: number) => void }) {
  const { t } = useI18n();
  const { json } = useApi();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState<boolean | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [results, setResults] = useState<boolean[]>([]);

  async function generate() {
    setLoading(true);
    const data = await json<Quiz>("/api/ai/quiz", { topicId: topicId ?? null, count: 6 });
    setLoading(false);
    if (!data) return;
    setQuiz(data);
    setIndex(0);
    setInput("");
    setChecked(null);
    setAnswers([]);
    setResults([]);
  }

  if (!quiz) {
    return (
      <Button onClick={generate} disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
        {loading ? t.practice.generating : t.practice.generate}
      </Button>
    );
  }

  const done = results.length === quiz.questions.length && checked === null;
  if (done) {
    const score = results.filter(Boolean).length;
    return (
      <Card>
        <CardContent className="space-y-4 text-center">
          <p className="font-heading text-5xl text-primary">{fmt(t.practice.score, { score, total: results.length })}</p>
          <Progress value={(score / results.length) * 100} />
          <ul className="space-y-2 text-left text-sm">
            {quiz.questions.map((q, i) => (
              <li key={i} className="flex gap-2">
                {results[i] ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-lagoon" />
                ) : (
                  <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                )}
                <span>
                  {q.prompt} — <b>{q.answer}</b>
                </span>
              </li>
            ))}
          </ul>
          <Button onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <RotateCcw />} {t.practice.newQuiz}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const q = quiz.questions[index];
  const isLast = index === quiz.questions.length - 1;

  function check(value: string) {
    const ok = normalize(value) === normalize(q.answer);
    setChecked(ok);
    setAnswers((a) => [...a, value]);
    setResults((r) => [...r, ok]);
  }

  async function next() {
    if (isLast) {
      const score = results.filter(Boolean).length;
      setChecked(null);
      void json("/api/quiz-attempts", {
        topicId: topicId ?? null,
        questions: quiz!.questions.map(({ prompt, answer, explanation, type }) => ({ prompt, answer, explanation, type })),
        answers,
        correct: results,
      });
      onFinished?.(score, results.length);
      return;
    }
    setIndex((i) => i + 1);
    setInput("");
    setChecked(null);
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {index + 1} / {quiz.questions.length}
          </span>
          <span className="uppercase tracking-wide">{q.type}</span>
        </div>
        <Progress value={(index / quiz.questions.length) * 100} className="h-1.5" />
        <CardTitle className="flex items-start gap-2 text-base font-medium leading-relaxed">
          <span className="flex-1">{q.prompt}</span>
          {q.type !== "translate" && <SpeakButton text={q.prompt.replace(/_+/g, "…")} />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {q.type === "choice" && q.options.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {q.options.map((opt) => {
              const chosen = answers[index] === opt;
              const isAnswer = normalize(opt) === normalize(q.answer);
              return (
                <Button
                  key={opt}
                  variant="outline"
                  disabled={checked !== null}
                  onClick={() => check(opt)}
                  className={cn(
                    "h-auto justify-start whitespace-normal py-3 text-left disabled:opacity-100",
                    checked !== null && isAnswer && "border-brand-lagoon bg-brand-lagoon/20",
                    checked === false && chosen && "border-destructive bg-destructive/10",
                  )}
                >
                  {opt}
                </Button>
              );
            })}
          </div>
        ) : (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim() && checked === null) check(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={checked !== null}
              placeholder={t.practice.writePlaceholder}
              autoFocus
              lang="de"
            />
            <Button type="submit" disabled={!input.trim() || checked !== null}>
              {t.practice.check}
            </Button>
          </form>
        )}

        {checked !== null && (
          <div
            className={cn(
              "space-y-1 rounded-lg p-3 text-sm",
              checked ? "bg-brand-lagoon/15" : "bg-destructive/10",
            )}
          >
            <p className="font-semibold">{checked ? t.practice.correct : fmt(t.practice.wrong, { answer: q.answer })}</p>
            <p className="text-muted-foreground">{q.explanation}</p>
          </div>
        )}

        {checked !== null && (
          <Button onClick={next} className="w-full sm:w-auto">
            {isLast ? t.practice.finish : t.practice.next}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
