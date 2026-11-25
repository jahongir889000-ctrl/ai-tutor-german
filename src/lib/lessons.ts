import "server-only";
import type { LessonProgress } from "@prisma/client";
import { isBasicTopic, type Topic } from "@/content/curriculum";
import { db } from "@/lib/db";
import { FREE_LESSON_LIMIT, isPro } from "@/lib/plans";
import type { CurrentUser } from "@/lib/session";

export type LessonAccess =
  | { allowed: true; progress: LessonProgress | null }
  | { allowed: false; reason: "pro" | "limit"; progress: null };

export async function getLessonsUsed(userId: string) {
  return db.lessonProgress.count({ where: { userId } });
}

export async function getLessonAccess(user: CurrentUser, topic: Topic): Promise<LessonAccess> {
  const progress = await db.lessonProgress.findUnique({
    where: { userId_topicId: { userId: user.id, topicId: topic.id } },
  });
  if (isPro(user) || progress) return { allowed: true, progress };
  if (!isBasicTopic(topic)) return { allowed: false, reason: "pro", progress: null };
  const used = await getLessonsUsed(user.id);
  if (used >= FREE_LESSON_LIMIT) return { allowed: false, reason: "limit", progress: null };
  return { allowed: true, progress: null };
}

export async function getProgressMap(userId: string) {
  const rows = await db.lessonProgress.findMany({ where: { userId } });
  return new Map(rows.map((r) => [r.topicId, r]));
}
