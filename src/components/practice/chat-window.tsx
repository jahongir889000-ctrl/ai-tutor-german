"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SpeakButton } from "@/components/speak-button";
import { useApi } from "@/hooks/use-api";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

export interface ChatMsg {
  role: "user" | "model";
  text: string;
}

/** Tiny markdown: **bold** and line breaks. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((p, i) => (p.startsWith("**") && p.endsWith("**") ? <b key={i}>{p.slice(2, -2)}</b> : p))}
    </span>
  );
}

export function ChatWindow({ initial, topicId }: { initial: ChatMsg[]; topicId?: string | null }) {
  const { t } = useI18n();
  const { request } = useApi();
  const welcome: ChatMsg = { role: "model", text: t.practice.chatWelcome };
  const [messages, setMessages] = useState<ChatMsg[]>(initial.length ? initial : [welcome]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    const history = [...messages, { role: "user" as const, text }];
    setMessages([...history, { role: "model", text: "" }]);
    setInput("");
    setStreaming(true);

    // Gemini expects the conversation to start with a user turn.
    const payload = history.slice(history.findIndex((m) => m.role === "user")).slice(-30);
    const res = await request("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: payload, topicId: topicId ?? null }),
    });
    if (!res?.body) {
      setMessages(history.slice(0, -1));
      setInput(text);
      setStreaming(false);
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "model", text: acc }]);
      }
    } catch {
      setMessages([...history, { role: "model", text: acc || t.common.error }]);
    }
    setStreaming(false);
  }

  async function reset() {
    await request("/api/ai/chat", { method: "DELETE" });
    setMessages([welcome]);
  }

  return (
    <Card className="flex h-[70vh] min-h-[28rem] flex-col">
      <CardHeader className="flex flex-row items-center justify-end border-b">
        <Button variant="ghost" size="sm" onClick={reset} disabled={streaming}>
          <RotateCcw /> {t.practice.clearChat}
        </Button>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 overflow-y-auto py-4" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" && "justify-end")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed",
                m.role === "user"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-secondary text-secondary-foreground",
              )}
            >
              {m.text ? <Rich text={m.text} /> : <Loader2 className="size-4 animate-spin" />}
              {m.role === "model" && m.text && !streaming && (
                <SpeakButton text={m.text.replace(/\*\*/g, "").replace(/✏️.*\n?/g, "")} className="-mb-1 ml-1 size-6 align-middle" />
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </CardContent>
      <CardFooter className="border-t pt-4">
        <form
          className="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <Textarea
            lang="de"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder={t.practice.chatPlaceholder}
            className="min-h-10 resize-none"
          />
          <Button type="submit" disabled={streaming || !input.trim()} aria-label={t.practice.send}>
            {streaming ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
