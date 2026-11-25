import { NextResponse } from "next/server";
import { z } from "zod";
import { guarded, readJson } from "@/lib/api";
import { generateJson, synthesizeSpeech } from "@/lib/ai/gemini";
import { tutorSystem } from "@/lib/ai/prompts";
import { listeningSchema } from "@/lib/ai/schemas";
import { targetLevel, topicForUser, userLocale } from "@/lib/access";
import { listeningKey, putAudio, signedUrl, storageEnabled } from "@/lib/storage";

const bodySchema = z.object({ topicId: z.string().nullish() });

/** Generates a short dialogue, voices it with two Gemini TTS speakers and adds comprehension questions. */
export const POST = guarded(
  async (req, user) => {
    const { topicId } = await readJson(req, (v) => bodySchema.parse(v));
    const topic = topicForUser(user, topicId);
    const exercise = await generateJson(listeningSchema, {
      system: tutorSystem(
        { levelId: targetLevel(user, topic), locale: userLocale(user), topicId: topic?.id },
        `Write a realistic everyday German dialogue between two people (6-10 lines) at the learner's level, then 3-5 multiple-choice
comprehension questions in the interface language (3 options each, "answer" must equal one option exactly). Speaker names in "lines" must match "speakers".`,
      ),
      contents: `Seed ${Math.random().toString(36).slice(2, 8)}`,
      temperature: 0.9,
    });

    const [a, b] = exercise.speakers;
    const script = exercise.lines.map((l) => `${l.speaker}: ${l.text}`).join("\n");
    const audio = await synthesizeSpeech(script, {
      speakers: [
        { name: a, voice: "Kore" },
        { name: b, voice: "Puck" },
      ],
    });

    // Store the dialogue audio in Neon Object Storage and hand the browser a presigned URL
    // instead of a multi-megabyte base64 payload.
    if (storageEnabled()) {
      const key = await putAudio(listeningKey(user.id), Buffer.from(audio.base64, "base64"));
      return NextResponse.json({ ...exercise, audio: await signedUrl(key) });
    }
    return NextResponse.json({ ...exercise, audio: `data:${audio.mimeType};base64,${audio.base64}` });
  },
  { pro: true, practice: true },
);
