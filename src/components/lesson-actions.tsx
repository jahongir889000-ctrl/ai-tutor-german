"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { completeLesson, startLesson } from "@/actions/lessons";
import { useI18n } from "@/i18n/client";

export function StartLessonButton({ topicId }: { topicId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      size="lg"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await startLesson(topicId);
          if ("error" in res) toast.error(res.error === "limit" ? t.learn.lockedLimit : t.learn.lockedPro);
          router.refresh();
        })
      }
    >
      {pending ? <Loader2 className="animate-spin" /> : <Play />}
      {t.learn.start}
    </Button>
  );
}

export function CompleteLessonButton({ topicId, completed }: { topicId: string; completed: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  if (completed) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-brand-pine dark:text-brand-lagoon">
        <CheckCircle2 className="size-4" /> {t.learn.completed}
      </span>
    );
  }
  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await completeLesson(topicId);
          router.refresh();
        })
      }
    >
      {pending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
      {t.learn.complete}
    </Button>
  );
}
