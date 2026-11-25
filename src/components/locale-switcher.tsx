"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setLocale } from "@/actions/preferences";
import { useI18n } from "@/i18n/client";

export function LocaleSwitcher() {
  const { locale } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const next = locale === "ru" ? "en" : "ru";

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      aria-label={`Switch language to ${next.toUpperCase()}`}
      onClick={() =>
        start(async () => {
          await setLocale(next);
          router.refresh();
        })
      }
    >
      <Languages />
      {locale.toUpperCase()}
    </Button>
  );
}
