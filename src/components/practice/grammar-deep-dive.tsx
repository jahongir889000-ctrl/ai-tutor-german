"use client";

import { useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpeakButton } from "@/components/speak-button";
import { useApi } from "@/hooks/use-api";
import { useI18n } from "@/i18n/client";
import type { GrammarExplanation } from "@/lib/ai/schemas";

export function GrammarDeepDive({ topicId }: { topicId: string }) {
  const { t } = useI18n();
  const { json } = useApi();
  const [data, setData] = useState<GrammarExplanation | null>(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(q?: string) {
    setLoading(true);
    const res = await json<GrammarExplanation>("/api/ai/grammar", { topicId, question: q || undefined });
    setLoading(false);
    if (res) {
      setData(res);
      setQuestion("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => ask()} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {t.learn.explainMore}
        </Button>
        <form
          className="flex min-w-60 flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (question.trim()) ask(question);
          }}
        >
          <Input
            size={1}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t.learn.askAboutRule}
            className="h-8"
          />
          <Button type="submit" size="icon-sm" disabled={loading || !question.trim()} aria-label={t.practice.send}>
            <Send />
          </Button>
        </form>
      </div>
      {data && (
        <div className="space-y-3 rounded-lg border bg-card p-4 text-sm">
          <p className="font-semibold">{data.title}</p>
          <p className="whitespace-pre-line leading-relaxed">{data.explanation}</p>
          <ul className="space-y-1">
            {data.examples.map((ex) => (
              <li key={ex.de} className="flex items-center gap-1">
                <SpeakButton text={ex.de} />
                <span lang="de" className="font-medium">
                  {ex.de}
                </span>
                <span className="text-muted-foreground">— {ex.translation}</span>
              </li>
            ))}
          </ul>
          {data.tips.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              {data.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
