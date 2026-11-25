"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LOCALE_COOKIE, isLocale } from "@/i18n";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { safeTimeZone } from "@/lib/usage-window";
import { getLevel } from "@/content/curriculum";
import { isPro } from "@/lib/plans";
import { isBasicLevel } from "@/content/curriculum";

export async function setLocale(locale: string) {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  const user = await getCurrentUser();
  if (user) await db.user.update({ where: { id: user.id }, data: { locale } });
  revalidatePath("/", "layout");
}

const settingsSchema = z.object({
  name: z.string().trim().max(60).optional(),
  timezone: z.string().min(1).max(64),
  level: z.string(),
  locale: z.string().optional(),
});

export type SettingsState = { ok?: boolean; error?: string };

/** Used by onboarding and settings forms. */
export async function saveSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauthorized" };
  const parsed = settingsSchema.safeParse({
    name: formData.get("name") ?? undefined,
    timezone: formData.get("timezone"),
    level: formData.get("level"),
    locale: formData.get("locale") ?? undefined,
  });
  if (!parsed.success) return { error: "invalid" };
  const { name, timezone, level, locale } = parsed.data;

  const lvl = getLevel(level);
  const allowedLevel = lvl && (isPro(user) || isBasicLevel(lvl)) ? lvl.id : user.currentLevel;

  await db.user.update({
    where: { id: user.id },
    data: {
      ...(name !== undefined ? { name: name || null } : {}),
      timezone: safeTimeZone(timezone),
      currentLevel: allowedLevel,
      onboarded: true,
      ...(locale && isLocale(locale) ? { locale } : {}),
    },
  });
  if (locale && isLocale(locale)) {
    (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
