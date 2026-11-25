"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2, PenLine, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useApi } from "@/hooks/use-api";
import { useI18n } from "@/i18n/client";

interface CheckResponse {
  correct: boolean;
  corrected: string;
  summary: string;
  detailed: boolean;
  mistakes: { type: string; original: string; correction: string; explanation: string }[];
  mistakeCount: number;
}

export function WritingTask({ topicId }: { topicId: string }) {
  const { t } = useI18n();
  const { json } = useApi();
  const [task, setTask] = useState<{ instruction: string; hint: string } | null>(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [loading, setLoading] = useState<"task" | "check" | null>(null);

  async function newTask() {
    setLoading("task");
    const data = await json<{ instruction: string; hint: string }>("/api/ai/check", { topicId }, "PUT");
    setLoading(null);
    if (data) {
      setTask(data);
      setText("");
      setResult(null);
    }
  }

  async function check() {
    setLoading("check");
    const data = await json<CheckResponse>("/api/ai/check", { topicId, instruction: task?.instruction, text });
    setLoading(null);
    if (data) setResult(data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PenLine className="size-4" /> {t.learn.task}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!task ? (
          <Button variant="outline" onClick={newTask} disabled={loading !== null}>
            {loading === "task" ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {t.practice.generate}
          </Button>
        ) : (
          <>
            <div className="rounded-lg bg-secondary p-3 text-sm">
              <p>{task.instruction}</p>
              <p className="mt-1 text-xs text-muted-foreground">💡 {task.hint}</p>
            </div>
            <Textarea
              lang="de"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.practice.writePlaceholder}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={check} disabled={!text.trim() || loading !== null}>
                {loading === "check" && <Loader2 className="animate-spin" />}
                {t.practice.check}
              </Button>
              <Button variant="ghost" onClick={newTask} disabled={loading !== null}>
                {t.practice.next}
              </Button>
            </div>
          </>
        )}

        {result && (
          <div className="space-y-3 rounded-lg border p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold">
              {result.correct && <CheckCircle2 className="size-4 text-brand-lagoon" />}
              {result.summary}
            </p>
            {!result.correct && (
              <p>
                <span className="text-muted-foreground">{t.practice.corrected}: </span>
                <b lang="de">{result.corrected}</b>
              </p>
            )}
            {result.detailed ? (
              result.mistakes.length > 0 && (
                <ul className="space-y-2">
                  {result.mistakes.map((m, i) => (
                    <li key={i} className="rounded-md bg-muted p-2">
                      <Badge variant="outline" className="mb-1">
                        {t.mistakes.types[m.type as keyof typeof t.mistakes.types] ?? m.type}
                      </Badge>
                      <p>
                        <s className="text-destructive">{m.original}</s> → <b>{m.correction}</b>
                      </p>
                      <p className="text-xs text-muted-foreground">{m.explanation}</p>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              result.mistakeCount > 0 && (
                <Link href="/pricing" className="block text-xs text-pro underline">
                  {t.practice.detailedPro} ({result.mistakeCount})
                </Link>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
