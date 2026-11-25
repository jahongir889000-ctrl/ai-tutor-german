"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n";
import type { ListeningExercise as Exercise } from "@/lib/ai/schemas";
import { cn } from "@/lib/utils";

type WithAudio = Exercise & { audio: string };

export function ListeningExercise({ topicId }: { topicId?: string | null }) {
  const { t } = useI18n();
  const { json } = useApi();
  const [ex, setEx] = useState<WithAudio | null>(null);
  const [loading, setLoading] = useState(false);
  const [showText, setShowText] = useState(false);
  const [picked, setPicked] = useState<Record<number, string>>({});

  async function generate() {
    setLoading(true);
    const data = await json<WithAudio>("/api/ai/listening", { topicId: topicId ?? null });
    setLoading(false);
    if (data) {
      setEx(data);
      setPicked({});
      setShowText(false);
    }
  }

  const answered = ex ? Object.keys(picked).length : 0;
  const score = ex ? ex.questions.filter((q, i) => picked[i] === q.answer).length : 0;

  return (
    <div className="space-y-6">
      <Button onClick={generate} disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
        {loading ? t.practice.generating : t.practice.listeningGenerate}
      </Button>

      {ex && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{ex.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <audio controls src={ex.audio} className="w-full" />
              <Button variant="ghost" size="sm" onClick={() => setShowText((s) => !s)}>
                {showText ? <EyeOff /> : <Eye />}
                {showText ? t.practice.hideTranscript : t.practice.showTranscript}
              </Button>
              {showText && (
                <div lang="de" className="space-y-1 rounded-lg bg-muted p-3 text-sm">
                  {ex.lines.map((l, i) => (
                    <p key={i}>
                      <b>{l.speaker}:</b> {l.text}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.practice.questions}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {ex.questions.map((q, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-sm font-medium">
                    {i + 1}. {q.question}
                  </p>
                  <div className="grid gap-1.5">
                    {q.options.map((opt) => {
                      const chosen = picked[i] === opt;
                      const reveal = picked[i] !== undefined;
                      return (
                        <Button
                          key={opt}
                          variant="outline"
                          size="sm"
                          disabled={reveal}
                          onClick={() => setPicked((p) => ({ ...p, [i]: opt }))}
                          className={cn(
                            "h-auto justify-start whitespace-normal py-2 text-left disabled:opacity-100",
                            reveal && opt === q.answer && "border-brand-lagoon bg-brand-lagoon/20",
                            reveal && chosen && opt !== q.answer && "border-destructive bg-destructive/10",
                          )}
                        >
                          {opt}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {answered === ex.questions.length && (
                <p className="font-heading text-4xl text-primary">
                  {fmt(t.practice.score, { score, total: ex.questions.length })}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
