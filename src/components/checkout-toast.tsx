"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useI18n } from "@/i18n/client";

/** Shows a toast after returning from Stripe Checkout (?checkout=success|canceled). */
export function CheckoutToast() {
  const params = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const status = params.get("checkout");

  useEffect(() => {
    if (status === "success") {
      toast.success(t.pricing.success);
      // the webhook may land a moment later
      const id = setTimeout(() => router.refresh(), 4000);
      return () => clearTimeout(id);
    }
    if (status === "canceled") toast(t.pricing.canceled);
  }, [status, router, t]);

  return null;
}
