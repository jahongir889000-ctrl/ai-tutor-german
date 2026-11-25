"use client";

import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n";
import { formatDuration } from "@/lib/format";
import { useNow } from "@/hooks/use-now";
import { useUsage } from "./usage-provider";

export function LimitDialog({ open }: { open: boolean }) {
  const { t, locale } = useI18n();
  const { usage } = useUsage();
  const now = useNow(15_000);
  const left = now ? new Date(usage.nextResetAt).getTime() - now : 0;

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mb-2 grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
            <Clock />
          </div>
          <DialogTitle className="text-4xl">{t.usage.limitTitle}</DialogTitle>
          <DialogDescription>{fmt(t.usage.limitText, { time: formatDuration(left, locale) })}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard">{t.nav.dashboard}</Link>
          </Button>
          <Button asChild className="bg-pro text-pro-foreground hover:bg-pro/90">
            <Link href="/pricing">
              <Sparkles />
              {t.usage.limitCta}
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
