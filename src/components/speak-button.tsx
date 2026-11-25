"use client";

import { useRef, useState } from "react";
import { Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUsage } from "@/components/usage/usage-provider";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

const cache = new Map<string, string>();

/**
 * Plays German audio for `text`. Pro users get natural Gemini TTS; Free users get the
 * browser's built-in German voice.
 */
export function SpeakButton({ text, className, size = "icon-sm" }: { text: string; className?: string; size?: "icon-sm" | "icon" }) {
  const { usage } = useUsage();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function play() {
    if (!usage.unlimited) {
      if (!("speechSynthesis" in window)) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "de-DE";
      u.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      return;
    }
    let url = cache.get(text);
    if (!url) {
      setLoading(true);
      try {
        const res = await fetch("/api/ai/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error();
        url = URL.createObjectURL(await res.blob());
        cache.set(text, url);
      } catch {
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    audioRef.current?.pause();
    audioRef.current = new Audio(url);
    void audioRef.current.play();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={cn("text-muted-foreground hover:text-foreground", className)}
      onClick={play}
      aria-label={`${t.learn.listen}: ${text}`}
      disabled={loading}
    >
      {loading ? <Loader2 className="animate-spin" /> : <Volume2 />}
    </Button>
  );
}
