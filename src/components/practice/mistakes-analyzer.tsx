"use client";

import { useState } from "react";
import { Eye, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import { useI18n } from "@/i18n/client";
import type { MistakesReport } from "@/lib/ai/schemas";

export function MistakesAnalyzer() {
  const { t } = useI18n();
  const { json } = useApi();
  const [report, setReport] = useState<MistakesReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  async function analyze() {
    setLoading(true);
    const data = await json<MistakesReport>("/api/ai/mistakes");
    setLoading(false);
    if (data) {
      setReport(data);
      setRevealed(new Set());
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={analyze} disabled={loading} className="bg-pro text-pro-foreground hover:bg-pro/90">
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
        {loading ? t.mistakes.analyzing : t.mistakes.analyze}
      </Button>
      {report && (
        <Card className="border-pro/40">
          <CardHeader>
            <CardTitle className="text-base">{t.mistakes.report}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            <p className="leading-relaxed">{report.summary}</p>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.mistakes.focus}</p>
              {report.focusAreas.map((f, i) => (
                <div key={i} className="rounded-md bg-muted p-3">
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-muted-foreground">{f.explanation}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.mistakes.drills}</p>
              <ol className="list-decimal space-y-2 pl-5">
                {report.drills.map((d, i) => (
                  <li key={i}>
                    <span lang="de">{d.prompt}</span>{" "}
                    {revealed.has(i) ? (
                      <b lang="de" className="text-brand-pine dark:text-brand-lagoon">
                        → {d.answer}
                      </b>
                    ) : (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setRevealed((s) => new Set(s).add(i))}
                        aria-label="Show answer"
                      >
                        <Eye />
                      </Button>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
