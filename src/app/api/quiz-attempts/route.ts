import { NextResponse } from "next/server";
import { z } from "zod";
import { guarded, readJson } from "@/lib/api";
import { db } from "@/lib/db";

const bodySchema = z.object({
  topicId: z.string().nullish(),
  questions: z.array(
    z.object({ prompt: z.string(), answer: z.string(), explanation: z.string(), type: z.string() }),
  ),
  answers: z.array(z.string()),
  correct: z.array(z.boolean()),
});

/** Store a finished quiz and log wrong answers as mistakes. */
export const POST = guarded(async (req, user) => {
  const body = await readJson(req, (v) => bodySchema.parse(v));
  const score = body.correct.filter(Boolean).length;

  await db.quizAttempt.create({
    data: {
      userId: user.id,
      topicId: body.topicId ?? null,
      questions: body.questions,
      answers: body.answers,
      score,
      total: body.questions.length,
    },
  });

  const wrong = body.questions
    .map((q, i) => ({ q, a: body.answers[i] ?? "", ok: body.correct[i] }))
    .filter((x) => !x.ok);
  if (wrong.length) {
    await db.mistake.createMany({
      data: wrong.map(({ q, a }) => ({
        userId: user.id,
        type: q.type === "translate" ? "VOCABULARY" : "GRAMMAR",
        original: `${q.prompt} → ${a || "—"}`,
        correction: q.answer,
        explanation: q.explanation,
        topicId: body.topicId ?? null,
      })),
    });
  }

  return NextResponse.json({ score, total: body.questions.length });
});
