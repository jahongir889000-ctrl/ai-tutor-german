import { NextResponse } from "next/server";
import { z } from "zod";
import { guarded, readJson } from "@/lib/api";
import { generateJson } from "@/lib/ai/gemini";
import { tutorSystem } from "@/lib/ai/prompts";
import { grammarSchema } from "@/lib/ai/schemas";
import { targetLevel, topicForUser, userLocale } from "@/lib/access";

const bodySchema = z.object({
  topicId: z.string(),
  question: z.string().max(500).optional(),
});

export const POST = guarded(
  async (req, user) => {
    const { topicId, question } = await readJson(req, (v) => bodySchema.parse(v));
    const topic = topicForUser(user, topicId)!;
    const result = await generateJson(grammarSchema, {
      system: tutorSystem(
        { levelId: targetLevel(user, topic), locale: userLocale(user), topicId: topic.id },
        "Explain the topic's grammar rule clearly for this learner, with natural German examples and translations, plus practical tips and common pitfalls.",
      ),
      contents: question
        ? `The learner asks about "${topic.grammar.title.en}": ${question}`
        : `Explain "${topic.grammar.title.en}" in more depth than: ${topic.grammar.rule.en}`,
      temperature: 0.5,
    });
    return NextResponse.json(result);
  },
  { practice: true },
);
