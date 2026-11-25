import { NextResponse } from "next/server";
import { z } from "zod";
import { guarded } from "@/lib/api";
import { generateJson } from "@/lib/ai/gemini";
import { tutorSystem } from "@/lib/ai/prompts";
import { speakingSchema } from "@/lib/ai/schemas";
import { readAudio, readForm } from "@/lib/ai/audio";
import { targetLevel, topicForUser, userLocale } from "@/lib/access";
import { db } from "@/lib/db";

const historySchema = z.array(z.object({ role: z.enum(["user", "model"]), text: z.string().max(1000) })).max(20);

/** Voice conversation turn: learner audio in → transcript, corrections and the tutor's reply. */
export const POST = guarded(
  async (req, user) => {
    const form = await readForm(req);
    const audio = await readAudio(form);
    const history = historySchema.parse(JSON.parse(String(form.get("history") ?? "[]")));
    const topic = topicForUser(user, (form.get("topicId") as string | null) || null);

    const result = await generateJson(speakingSchema, {
      system: tutorSystem(
        { levelId: targetLevel(user, topic), locale: userLocale(user), topicId: topic?.id },
        `Speaking practice. The learner answers your last question by voice.
Transcribe the learner's German exactly, list grammar/word-choice corrections (explanations in the interface language),
rate fluency 0-100, then reply naturally in German (2-3 short sentences at the learner's level) ending with a follow-up question.`,
      ),
      contents: [
        // Gemini conversations must begin with a user turn
        ...(history[0]?.role === "model" ? [{ role: "user", parts: [{ text: "Let's start the speaking practice." }] }] : []),
        ...history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: "user", parts: [{ inlineData: { data: audio.base64, mimeType: audio.mimeType } }] },
      ],
      temperature: 0.6,
    });

    if (result.corrections.length) {
      await db.mistake.createMany({
        data: result.corrections.slice(0, 5).map((c) => ({
          userId: user.id,
          type: "GRAMMAR" as const,
          original: c.original,
          correction: c.correction,
          explanation: c.explanation,
          topicId: topic?.id ?? null,
        })),
      });
    }
    return NextResponse.json(result);
  },
  { pro: true, practice: true },
);
