import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Dict } from "@/i18n";

export function ProGate({ t, title, text }: { t: Dict; title?: string; text?: string }) {
  return (
    <Card className="mx-auto max-w-xl border-2 border-dashed border-pro/50 text-center">
      <CardContent className="flex flex-col items-center gap-4 py-6">
        <div className="grid size-14 place-items-center rounded-full bg-pro text-pro-foreground">
          <Lock />
        </div>
        <h2 className="text-5xl text-pro">{title ?? t.proGate.title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{text ?? t.proGate.text}</p>
        <Button asChild className="bg-pro text-pro-foreground hover:bg-pro/90">
          <Link href="/pricing">
            <Sparkles /> {t.proGate.cta}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function ProBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`rounded-full bg-pro px-2 py-0.5 text-[10px] font-medium text-pro-foreground ${className}`}>Pro</span>
  );
}
