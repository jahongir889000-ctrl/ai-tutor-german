import { NextResponse } from "next/server";
import { z } from "zod";
import { guarded, readJson } from "@/lib/api";
import { generateJson } from "@/lib/ai/gemini";
import { tutorSystem } from "@/lib/ai/prompts";
import { vocabSchema } from "@/lib/ai/schemas";
import { targetLevel, topicForUser, userLocale } from "@/lib/access";
import { db } from "@/lib/db";

const bodySchema = z.object({ topicId: z.string().nullish() });

export const POST = guarded(
  async (req, user) => {
    const { topicId } = await readJson(req, (v) => bodySchema.parse(v));
    const topic = topicForUser(user, topicId);
    const known = await db.vocabItem.findMany({
      where: { userId: user.id },
      select: { de: true },
      take: 200,
      orderBy: { createdAt: "desc" },
    });
    const exclude = [...known.map((k) => k.de), ...(topic?.words.map((w) => w.de) ?? [])];
    const result = await generateJson(vocabSchema, {
      system: tutorSystem(
        { levelId: targetLevel(user, topic), locale: userLocale(user), topicId: topic?.id },
        "Suggest 8 useful new German words or set phrases for this learner with translation into the interface language and a short example sentence. Nouns must include the article.",
      ),
      contents: `Do not repeat these words: ${exclude.join(", ") || "(none)"}`,
      temperature: 0.9,
    });
    return NextResponse.json(result);
  },
  { practice: true },
);

const saveSchema = z.object({
  de: z.string().min(1).max(120),
  translation: z.string().min(1).max(200),
  example: z.string().max(300).optional(),
  topicId: z.string().nullish(),
});

/** Save a word to the learner's personal vocabulary. */
export const PUT = guarded(async (req, user) => {
  const w = await readJson(req, (v) => saveSchema.parse(v));
  const item = await db.vocabItem.upsert({
    where: { userId_de: { userId: user.id, de: w.de } },
    create: { userId: user.id, de: w.de, translation: w.translation, example: w.example, topicId: w.topicId ?? null },
    update: { translation: w.translation, example: w.example },
  });
  return NextResponse.json({ id: item.id });
});
