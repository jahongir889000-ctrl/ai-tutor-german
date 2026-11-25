"use client";

import Link from "next/link";
import { Infinity as InfinityIcon, Timer } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n";
import { formatDuration } from "@/lib/format";
import { useNow } from "@/hooks/use-now";
import { useUsage } from "./usage-provider";
import { cn } from "@/lib/utils";

export function UsageMeter({ className }: { className?: string }) {
  const { t, locale } = useI18n();
  const { usage, blocked } = useUsage();
  const now = useNow();

  if (usage.unlimited) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-pro px-3 py-1 text-xs text-pro-foreground", className)}>
        <InfinityIcon className="size-3.5" /> Pro
      </span>
    );
  }

  const remaining = usage.remainingSeconds ?? 0;
  const pct = Math.min(100, (remaining / usage.limitSeconds) * 100);
  const resetIn = now ? formatDuration(new Date(usage.nextResetAt).getTime() - now, locale) : "…";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href="/pricing"
          className={cn("flex w-40 flex-col gap-1 rounded-md px-2 py-1 text-xs hover:bg-accent", className)}
        >
          <span className={cn("flex items-center gap-1", blocked && "text-destructive")}>
            <Timer className="size-3.5" />
            {fmt(t.usage.left, { min: Math.ceil(remaining / 60) })}
          </span>
          <Progress value={pct} className="h-1.5" />
        </Link>
      </TooltipTrigger>
      <TooltipContent>{fmt(t.usage.reset, { time: resetIn })}</TooltipContent>
    </Tooltip>
  );
}
