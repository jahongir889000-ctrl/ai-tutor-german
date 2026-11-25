"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

async function redirectTo(endpoint: string, errorText: string, onUnauthorized: () => void) {
  const res = await fetch(endpoint, { method: "POST" });
  if (res.status === 401) return onUnauthorized();
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    toast.error(data.message ?? errorText);
    return;
  }
  window.location.href = data.url;
}

export function UpgradeButton({ className, label }: { className?: string; label?: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <Button
      className={cn("bg-pro text-pro-foreground hover:bg-pro/90", className)}
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await redirectTo("/api/stripe/checkout", t.pricing.checkoutError, () => router.push("/register"));
        setLoading(false);
      }}
    >
      {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
      {label ?? t.pricing.upgrade}
    </Button>
  );
}

export function BillingPortalButton({ label, className }: { label: string; className?: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <Button
      variant="outline"
      className={className}
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await redirectTo("/api/stripe/portal", t.common.error, () => router.push("/login"));
        setLoading(false);
      }}
    >
      {loading && <Loader2 className="animate-spin" />}
      {label}
    </Button>
  );
}
