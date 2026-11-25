import { NextResponse } from "next/server";
import { z } from "zod";
import { guarded, readJson } from "@/lib/api";
import { generateJson } from "@/lib/ai/gemini";
import { tutorSystem } from "@/lib/ai/prompts";
import { checkSchema, taskSchema } from "@/lib/ai/schemas";
import { targetLevel, topicForUser, userLocale } from "@/lib/access";
import { db } from "@/lib/db";
import { isPro } from "@/lib/plans";

const bodySchema = z.object({
  topicId: z.string().nullish(),
  instruction: z.string().max(500).optional(),
  text: z.string().min(1).max(1500),
});

/** Check a learner's written German. Free gets the corrected text; Pro also gets a detailed breakdown. */
export const POST = guarded(
  async (req, user) => {
    const { topicId, instruction, text } = await readJson(req, (v) => bodySchema.parse(v));
    const topic = topicForUser(user, topicId);
    const result = await generateJson(checkSchema, {
      system: tutorSystem(
        { levelId: targetLevel(user, topic), locale: userLocale(user), topicId: topic?.id },
        `Check the learner's German text${instruction ? ` written for the task: "${instruction}"` : ""}.
Mark correct=true only if it is grammatically correct and natural. List every mistake with its type, the wrong fragment, the correction and a short explanation.
Be encouraging in the summary.`,
      ),
      contents: text,
      temperature: 0.2,
    });

    if (result.mistakes.length) {
      await db.mistake.createMany({
        data: result.mistakes.slice(0, 10).map((m) => ({
          userId: user.id,
          type: m.type,
          original: m.original,
          correction: m.correction,
          explanation: m.explanation,
          topicId: topic?.id ?? null,
        })),
      });
    }

    const pro = isPro(user);
    return NextResponse.json({
      correct: result.correct,
      corrected: result.corrected,
      summary: result.summary,
      detailed: pro,
      mistakes: pro ? result.mistakes : [],
      mistakeCount: result.mistakes.length,
    });
  },
  { practice: true },
);

const taskBody = z.object({ topicId: z.string() });

/** Generate a short writing task for a topic. */
export const PUT = guarded(
  async (req, user) => {
    const { topicId } = await readJson(req, (v) => taskBody.parse(v));
    const topic = topicForUser(user, topicId)!;
    const task = await generateJson(taskSchema, {
      system: tutorSystem(
        { levelId: targetLevel(user, topic), locale: userLocale(user), topicId: topic.id },
        "Create one short writing task (1-3 German sentences expected) that makes the learner use the topic's grammar and words. Give a brief hint.",
      ),
      contents: `Seed ${Math.random().toString(36).slice(2, 8)}`,
      temperature: 0.9,
    });
    return NextResponse.json(task);
  },
  { practice: true },
);
