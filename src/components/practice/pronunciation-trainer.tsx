"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SpeakButton } from "@/components/speak-button";
import { useApi } from "@/hooks/use-api";
import { useRecorder } from "@/hooks/use-recorder";
import { useI18n } from "@/i18n/client";
import type { PronunciationResult } from "@/lib/ai/schemas";
import { cn } from "@/lib/utils";
import { RecordButton } from "./record-button";

interface Phrase {
  phrase: string;
  translation: string;
  focus: string;
}

function scoreColor(score: number) {
  if (score >= 85) return "text-brand-lagoon";
  if (score >= 60) return "text-primary";
  return "text-destructive";
}

export function PronunciationTrainer({ initial }: { initial: Phrase }) {
  const { t } = useI18n();
  const { json, request } = useApi();
  const recorder = useRecorder();
  const [phrase, setPhrase] = useState(initial);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [busy, setBusy] = useState<"phrase" | "score" | null>(null);

  async function newPhrase() {
    setBusy("phrase");
    const p = await json<Phrase>("/api/ai/pronunciation", {}, "PUT");
    setBusy(null);
    if (p) {
      setPhrase(p);
      setResult(null);
    }
  }

  async function record() {
    setResult(null);
    const blob = await recorder.start();
    if (!blob) return;
    setBusy("score");
    const form = new FormData();
    form.append("audio", blob, "recording");
    form.append("phrase", phrase.phrase);
    const res = await request("/api/ai/pronunciation", { method: "POST", body: form });
    setBusy(null);
    if (res) setResult(await res.json());
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">{t.practice.phrase}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p lang="de" className="text-2xl font-semibold leading-snug">
              {phrase.phrase}
            </p>
            <p className="text-sm text-muted-foreground">{phrase.translation}</p>
            <p className="text-xs text-muted-foreground">🎯 {phrase.focus}</p>
          </div>
          <div className="flex items-center gap-2">
            <SpeakButton text={phrase.phrase} size="icon" />
            <span className="text-xs text-muted-foreground">{t.practice.listenModel}</span>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={newPhrase} disabled={busy !== null || recorder.recording}>
              {busy === "phrase" ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              {t.practice.newPhrase}
            </Button>
          </div>
          <RecordButton recording={recorder.recording} busy={busy === "score"} onStart={record} onStop={recorder.stop} />
          {recorder.error && <p className="text-center text-sm text-destructive">{t.practice.micDenied}</p>}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-baseline justify-between text-sm font-normal text-muted-foreground">
              {t.practice.yourScore}
              <span className={cn("font-heading text-6xl", scoreColor(result.score))}>{Math.round(result.score)}</span>
            </CardTitle>
            <Progress value={result.score} />
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">{t.practice.heard}</p>
              <p lang="de" className="italic">
                “{result.transcript}”
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.words.map((w, i) => (
                <span
                  key={i}
                  lang="de"
                  className={cn(
                    "rounded-md border px-2 py-0.5",
                    w.score >= 85 ? "border-brand-lagoon bg-brand-lagoon/15" : w.score >= 60 ? "bg-muted" : "border-destructive bg-destructive/10",
                  )}
                  title={`${Math.round(w.score)}`}
                >
                  {w.word}
                </span>
              ))}
            </div>
            <p>{result.feedback}</p>
            {result.sounds.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{t.practice.sounds}</p>
                {result.sounds.map((s, i) => (
                  <div key={i} className="rounded-md bg-muted p-2">
                    <p>
                      <b lang="de">{s.sound}</b> — {s.issue}
                    </p>
                    <p className="text-xs text-muted-foreground">💡 {s.tip}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
