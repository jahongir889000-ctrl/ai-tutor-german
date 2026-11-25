import "server-only";
import { getTopic, isBasicTopic, type Locale, type Topic } from "@/content/curriculum";
import { HttpError } from "@/lib/api";
import { isPro } from "@/lib/plans";
import type { CurrentUser } from "@/lib/session";

/** Resolves a topic id and checks the plan allows it. */
export function topicForUser(user: CurrentUser, topicId: string | null | undefined): Topic | undefined {
  if (!topicId) return undefined;
  const topic = getTopic(topicId);
  if (!topic) throw new HttpError(404, "topic_not_found");
  if (!isPro(user) && !isBasicTopic(topic)) throw new HttpError(402, "pro_required");
  return topic;
}

export function userLocale(user: CurrentUser): Locale {
  return user.locale === "en" ? "en" : "ru";
}

/** Level the AI should target: the topic's level when practising a topic, else the user's. */
export function targetLevel(user: CurrentUser, topic?: Topic) {
  return topic?.levelId ?? user.currentLevel;
}
