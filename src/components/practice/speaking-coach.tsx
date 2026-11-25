"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SpeakButton } from "@/components/speak-button";
import { useApi } from "@/hooks/use-api";
import { useRecorder } from "@/hooks/use-recorder";
import { useI18n } from "@/i18n/client";
import type { SpeakingResult } from "@/lib/ai/schemas";
import { RecordButton } from "./record-button";

interface Turn {
  role: "user" | "model";
  text: string;
  result?: SpeakingResult;
}

const OPENERS = [
  "Hallo! Erzähl mir ein bisschen über dich. Wie heißt du und woher kommst du?",
  "Was hast du am letzten Wochenende gemacht?",
  "Wie sieht ein typischer Tag bei dir aus?",
  "Was ist dein Lieblingsessen und warum?",
];

export function SpeakingCoach() {
  const { t } = useI18n();
  const { request } = useApi();
  const recorder = useRecorder();
  const [turns, setTurns] = useState<Turn[]>(() => [{ role: "model", text: OPENERS[0] }]);
  const [busy, setBusy] = useState(false);

  async function record() {
    const blob = await recorder.start();
    if (!blob) return;
    setBusy(true);
    const form = new FormData();
    form.append("audio", blob, "answer");
    form.append("history", JSON.stringify(turns.slice(-10).map(({ role, text }) => ({ role, text }))));
    const res = await request("/api/ai/speaking", { method: "POST", body: form });
    setBusy(false);
    if (!res) return;
    const result: SpeakingResult = await res.json();
    setTurns((prev) => [...prev, { role: "user", text: result.transcript, result }, { role: "model", text: result.reply }]);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <p className="text-center text-sm text-muted-foreground">{t.practice.speakingPrompt}</p>
      <div className="space-y-3">
        {turns.map((turn, i) =>
          turn.role === "model" ? (
            <div key={i} className="flex items-start gap-2">
              <SpeakButton text={turn.text} />
              <div lang="de" className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-2 text-sm">
                {turn.text}
              </div>
            </div>
          ) : (
            <Card key={i} className="ml-auto max-w-[90%] py-3">
              <CardContent className="space-y-2 px-4 text-sm">
                <p className="text-xs text-muted-foreground">
                  {t.practice.transcript} · fluency {Math.round(turn.result?.fluency ?? 0)}/100
                </p>
                <p lang="de" className="italic">
                  “{turn.text}”
                </p>
                {turn.result && turn.result.corrections.length > 0 && (
                  <div className="space-y-1 border-t pt-2">
                    <p className="text-xs text-muted-foreground">{t.practice.corrections}</p>
                    {turn.result.corrections.map((c, j) => (
                      <p key={j}>
                        <s className="text-destructive">{c.original}</s> → <b lang="de">{c.correction}</b>
                        <span className="block text-xs text-muted-foreground">{c.explanation}</span>
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ),
        )}
      </div>
      <RecordButton recording={recorder.recording} busy={busy} onStart={record} onStop={recorder.stop} />
      {recorder.error && <p className="text-center text-sm text-destructive">{t.practice.micDenied}</p>}
    </div>
  );
}
