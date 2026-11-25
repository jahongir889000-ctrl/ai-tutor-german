import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProBadge } from "@/components/pro-gate";

export function PracticeHeader({
  title,
  text,
  backLabel,
  pro,
  children,
}: {
  title: string;
  text: string;
  backLabel: string;
  pro?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <Button asChild variant="ghost" size="sm">
        <Link href="/practice">
          <ArrowLeft /> {backLabel}
        </Link>
      </Button>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-6xl text-primary">
            {title} {pro && <ProBadge className="font-sans" />}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{text}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
