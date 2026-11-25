"use client";

import { usePathname, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/client";

export interface TopicOption {
  id: string;
  label: string;
  group: string;
}

/** Selects the practice topic via the ?topic= query param. */
export function TopicPicker({ options, value }: { options: TopicOption[]; value: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const groups = [...new Set(options.map((o) => o.group))];
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="topic" className="text-xs text-muted-foreground">
        {t.practice.chooseTopic}
      </Label>
      <select
        id="topic"
        value={value}
        onChange={(e) => router.replace(`${pathname}?topic=${e.target.value}`)}
        className="h-9 max-w-72 rounded-md border border-input bg-card px-2 text-sm"
      >
        {groups.map((g) => (
          <optgroup key={g} label={g}>
            {options
              .filter((o) => o.group === g)
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
