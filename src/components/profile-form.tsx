"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useBrowserTimezone, useTimezoneList } from "@/hooks/use-browser-timezone";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { saveSettings, type SettingsState } from "@/actions/preferences";
import { LEVELS, STAGES } from "@/content/curriculum";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

interface Props {
  mode: "onboarding" | "settings";
  pro: boolean;
  defaults: { name: string; level: string; timezone: string; locale: string };
}

export function ProfileForm({ mode, pro, defaults }: Props) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSettings, {});
  const [level, setLevel] = useState(defaults.level);
  const browserTz = useBrowserTimezone();
  const zones = useTimezoneList();
  const [tzChoice, setTz] = useState<string | null>(null);
  const preferBrowser = mode === "onboarding" || defaults.timezone === "UTC";
  const tz = tzChoice ?? (preferBrowser && browserTz ? browserTz : defaults.timezone);

  useEffect(() => {
    if (!state.ok) return;
    if (mode === "onboarding") router.push("/dashboard");
    else toast.success(t.settings.saved);
  }, [state, mode, router, t.settings.saved]);

  const zoneOptions = useMemo(() => (zones.includes(tz) ? zones : [tz, ...zones]), [zones, tz]);

  return (
    <form action={action} className="space-y-8">
      {mode === "settings" && (
        <div className="space-y-2">
          <Label htmlFor="name">{t.auth.name}</Label>
          <Input id="name" name="name" defaultValue={defaults.name} maxLength={60} />
        </div>
      )}

      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-medium">{mode === "onboarding" ? t.onboarding.level : t.settings.level}</legend>
        <input type="hidden" name="level" value={level} />
        <RadioGroup value={level} onValueChange={setLevel} className="space-y-4">
          {STAGES.map((stage) => (
            <div key={stage.id} className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {stage.title[locale]} · {stage.description[locale]}
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {LEVELS.filter((l) => l.stage === stage.id).map((l) => {
                  const disabled = !pro && !stage.free;
                  return (
                    <Label
                      key={l.id}
                      htmlFor={`lvl-${l.id}`}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:ring-2 has-[[data-state=checked]]:ring-ring/40",
                        disabled && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <RadioGroupItem id={`lvl-${l.id}`} value={l.id} disabled={disabled} className="mt-0.5" />
                      <span className="space-y-0.5">
                        <span className="block text-sm font-semibold">{l.code}</span>
                        <span className="block text-xs text-muted-foreground">
                          {l.title[locale]}
                          {disabled && ` · ${t.onboarding.proOnly}`}
                        </span>
                      </span>
                    </Label>
                  );
                })}
              </div>
            </div>
          ))}
        </RadioGroup>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="timezone">{t.onboarding.timezone}</Label>
          <select
            id="timezone"
            name="timezone"
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
          >
            {zoneOptions.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">{t.onboarding.timezoneHint}</p>
        </div>
        {mode === "settings" && (
          <div className="space-y-2">
            <Label htmlFor="locale">{t.settings.language}</Label>
            <select
              id="locale"
              name="locale"
              defaultValue={defaults.locale}
              className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
        )}
      </div>

      {state.error && <p className="text-sm text-destructive">{t.common.error}</p>}

      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        {mode === "onboarding" ? t.onboarding.submit : t.common.save}
      </Button>
    </form>
  );
}
