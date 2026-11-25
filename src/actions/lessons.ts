"use server";

import { revalidatePath } from "next/cache";
import { getTopic } from "@/content/curriculum";
import { db } from "@/lib/db";
import { getLessonAccess } from "@/lib/lessons";
import { getCurrentUser } from "@/lib/session";

export async function startLesson(topicId: string) {
  const user = await getCurrentUser();
  const topic = getTopic(topicId);
  if (!user || !topic) return { error: "not_found" as const };
  const access = await getLessonAccess(user, topic);
  if (!access.allowed) return { error: access.reason };
  if (!access.progress) {
    await db.lessonProgress.create({ data: { userId: user.id, topicId } });
  }
  revalidatePath(`/learn/${topic.levelId}/${topic.id}`);
  return { ok: true as const };
}

export async function completeLesson(topicId: string, score?: number) {
  const user = await getCurrentUser();
  const topic = getTopic(topicId);
  if (!user || !topic) return;
  await db.lessonProgress.updateMany({
    where: { userId: user.id, topicId },
    data: { status: "COMPLETED", completedAt: new Date(), ...(score !== undefined ? { score } : {}) },
  });
  revalidatePath("/learn", "layout");
  revalidatePath("/dashboard");
}
