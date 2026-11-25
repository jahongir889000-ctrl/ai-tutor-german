import type { Locale } from "@/content/curriculum";
import { en } from "./en";
import { ru, type Dict } from "./ru";

export type { Dict, Locale };

export const LOCALES: Locale[] = ["ru", "en"];
export const DEFAULT_LOCALE: Locale = "ru";
export const LOCALE_COOKIE = "locale";

const dictionaries: Record<Locale, Dict> = { ru, en };

export function isLocale(v: unknown): v is Locale {
  return v === "ru" || v === "en";
}

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale] ?? ru;
}

/** Replace {placeholders} in a template. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
