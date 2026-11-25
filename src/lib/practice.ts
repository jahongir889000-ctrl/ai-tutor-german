import "server-only";
import { LEVELS, getLevel, isBasicLevel, type Locale } from "@/content/curriculum";
import type { TopicOption } from "@/components/practice/topic-picker";
import { isPro } from "@/lib/plans";
import type { CurrentUser } from "@/lib/session";

/** Topics the user may practise, plus the selected one (from ?topic=, else the user's level). */
export function practiceTopics(user: CurrentUser, locale: Locale, requested?: string | string[]) {
  const pro = isPro(user);
  const levels = LEVELS.filter((l) => pro || isBasicLevel(l));
  const options: TopicOption[] = levels.flatMap((l) =>
    l.topics.map((tp) => ({ id: tp.id, label: `${tp.titleDe} — ${tp.title[locale]}`, group: `${l.code} · ${l.title[locale]}` })),
  );
  const req = typeof requested === "string" ? requested : undefined;
  const fallback = getLevel(user.currentLevel)?.topics[0]?.id ?? options[0]?.id;
  const selected = options.some((o) => o.id === req) ? req! : options.some((o) => o.id === fallback) ? fallback! : options[0].id;
  return { options, selected };
}
