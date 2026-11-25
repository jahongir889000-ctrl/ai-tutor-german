"use client";

import { Loader2, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

export function RecordButton({
  recording,
  busy,
  onStart,
  onStop,
}: {
  recording: boolean;
  busy: boolean;
  onStart: () => void;
  onStop: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        size="icon"
        disabled={busy}
        onClick={recording ? onStop : onStart}
        aria-label={recording ? t.practice.stop : t.practice.record}
        className={cn(
          "size-20 rounded-full shadow-lg [&_svg:not([class*='size-'])]:size-8",
          recording ? "animate-pulse bg-destructive hover:bg-destructive/90" : "bg-primary",
        )}
      >
        {busy ? <Loader2 className="animate-spin" /> : recording ? <Square /> : <Mic />}
      </Button>
      <span className="text-xs text-muted-foreground">
        {busy ? t.common.loading : recording ? t.practice.recording : t.practice.record}
      </span>
    </div>
  );
}
