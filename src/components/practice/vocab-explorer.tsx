"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SpeakButton } from "@/components/speak-button";
import { useApi } from "@/hooks/use-api";
import { useI18n } from "@/i18n/client";
import type { VocabList } from "@/lib/ai/schemas";

type Word = VocabList["words"][number];

export function SaveWordButton({ word, topicId }: { word: { de: string; translation: string; example?: string }; topicId?: string | null }) {
  const { t } = useI18n();
  const { json } = useApi();
  const [saved, setSaved] = useState(false);
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={saved ? t.practice.saved : t.practice.saveWord}
      title={saved ? t.practice.saved : t.practice.saveWord}
      disabled={saved}
      onClick={async () => {
        const ok = await json("/api/ai/vocab", { ...word, topicId: topicId ?? null }, "PUT");
        if (ok) setSaved(true);
      }}
    >
      {saved ? <BookmarkCheck className="text-brand-lagoon" /> : <Bookmark />}
    </Button>
  );
}

export function VocabExplorer({ topicId }: { topicId?: string | null }) {
  const { t } = useI18n();
  const { json } = useApi();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    const data = await json<VocabList>("/api/ai/vocab", { topicId: topicId ?? null });
    setLoading(false);
    if (data) setWords(data.words);
  }

  return (
    <div className="space-y-4">
      <Button onClick={generate} disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
        {loading ? t.practice.generating : t.practice.generate}
      </Button>
      <div className="grid gap-3 sm:grid-cols-2">
        {words.map((w) => (
          <Card key={w.de} className="py-4">
            <CardContent className="space-y-1 px-4">
              <div className="flex items-center gap-1">
                <SpeakButton text={w.de} />
                <span lang="de" className="font-semibold">
                  {w.de}
                </span>
                <span className="text-muted-foreground">— {w.translation}</span>
                <SaveWordButton word={{ de: w.de, translation: w.translation, example: w.example }} topicId={topicId} />
              </div>
              <p lang="de" className="text-sm">
                {w.example}
              </p>
              <p className="text-xs text-muted-foreground">{w.exampleTranslation}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
