import { NextResponse } from "next/server";
import { z } from "zod";
import { guarded, readJson } from "@/lib/api";
import { generateJson } from "@/lib/ai/gemini";
import { tutorSystem } from "@/lib/ai/prompts";
import { quizSchema } from "@/lib/ai/schemas";
import { targetLevel, topicForUser, userLocale } from "@/lib/access";

const bodySchema = z.object({
  topicId: z.string().nullish(),
  count: z.number().int().min(3).max(10).default(6),
});

export const POST = guarded(
  async (req, user) => {
    const { topicId, count } = await readJson(req, (v) => bodySchema.parse(v));
    const topic = topicForUser(user, topicId);
    const quiz = await generateJson(quizSchema, {
      system: tutorSystem(
        { levelId: targetLevel(user, topic), locale: userLocale(user), topicId: topic?.id },
        `Create a varied quiz of exactly ${count} questions: mix "choice" (4 options, one correct, answer must equal one option exactly),
"fill" (German sentence with ___ gap, answer is the missing word(s)) and "translate" (prompt in the interface language, answer in German).
Focus on the current topic's grammar and vocabulary. Avoid ambiguous questions.`,
      ),
      contents: `Generate a fresh quiz. Random seed: ${Math.random().toString(36).slice(2, 8)}`,
      temperature: 0.9,
    });
    return NextResponse.json(quiz);
  },
  { practice: true },
);
