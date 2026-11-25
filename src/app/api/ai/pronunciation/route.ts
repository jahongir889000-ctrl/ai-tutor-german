import { NextResponse } from "next/server";
import { z } from "zod";
import { guarded, readJson } from "@/lib/api";
import { generateJson } from "@/lib/ai/gemini";
import { tutorSystem } from "@/lib/ai/prompts";
import { phraseSchema, pronunciationSchema } from "@/lib/ai/schemas";
import { readAudio, readForm } from "@/lib/ai/audio";
import { targetLevel, topicForUser, userLocale } from "@/lib/access";
import { db } from "@/lib/db";

/** Score a recording of the learner reading `phrase`. */
export const POST = guarded(
  async (req, user) => {
    const form = await readForm(req);
    const phrase = z.string().min(1).max(300).parse(form.get("phrase"));
    const audio = await readAudio(form);

    const result = await generateJson(pronunciationSchema, {
      system: tutorSystem(
        { levelId: user.currentLevel, locale: userLocale(user) },
        `You are a German pronunciation coach. The learner was asked to read aloud: "${phrase}".
Listen to the audio. Transcribe exactly what was said, score overall pronunciation 0-100 (intelligibility, vowel length, umlauts ä/ö/ü, ch [ç/x], r, final devoicing, word stress),
score each target word 0-100, and list up to 5 specific problem sounds with practical tips. If the audio is silent or not German, give score 0 and say so.`,
      ),
      contents: [
        {
          role: "user",
          parts: [{ inlineData: { data: audio.base64, mimeType: audio.mimeType } }, { text: `Target phrase: ${phrase}` }],
        },
      ],
      temperature: 0.2,
    });

    if (result.score < 70 && result.sounds.length) {
      await db.mistake.createMany({
        data: result.sounds.slice(0, 3).map((s) => ({
          userId: user.id,
          type: "PRONUNCIATION" as const,
          original: `${s.sound}: ${s.issue}`,
          correction: phrase,
          explanation: s.tip,
        })),
      });
    }
    return NextResponse.json(result);
  },
  { pro: true, practice: true },
);

const phraseBody = z.object({ topicId: z.string().nullish() });

/** Get a new phrase to practise. */
export const PUT = guarded(
  async (req, user) => {
    const { topicId } = await readJson(req, (v) => phraseBody.parse(v));
    const topic = topicForUser(user, topicId);
    const phrase = await generateJson(phraseSchema, {
      system: tutorSystem(
        { levelId: targetLevel(user, topic), locale: userLocale(user), topicId: topic?.id },
        "Give one natural German sentence (5-12 words) for pronunciation practice that contains sounds hard for learners (ü, ö, ä, ch, r, z, sch, ei/ie).",
      ),
      contents: `Seed ${Math.random().toString(36).slice(2, 8)}`,
      temperature: 1,
    });
    return NextResponse.json(phrase);
  },
  { pro: true, practice: true },
);
