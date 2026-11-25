import { z } from "zod";
import { guarded, readJson } from "@/lib/api";
import { synthesizeSpeech } from "@/lib/ai/gemini";
import { audioExists, getObject, putAudio, storageEnabled, ttsKey } from "@/lib/storage";

const bodySchema = z.object({ text: z.string().min(1).max(400) });

const headers = { "Content-Type": "audio/wav", "Cache-Control": "private, max-age=86400" };

/**
 * Natural German pronunciation of a word or sentence (Gemini TTS).
 * Audio is cached in Neon Object Storage by content hash, so each phrase is synthesised once.
 */
export const POST = guarded(
  async (req) => {
    const { text } = await readJson(req, (v) => bodySchema.parse(v));

    if (!storageEnabled()) {
      const audio = await synthesizeSpeech(text);
      return new Response(Buffer.from(audio.base64, "base64"), { headers });
    }

    const key = ttsKey(text);
    if (await audioExists(key)) {
      return new Response(Buffer.from(await getObject(key)), { headers: { ...headers, "X-Audio-Cache": "hit" } });
    }
    const audio = await synthesizeSpeech(text);
    const wav = Buffer.from(audio.base64, "base64");
    await putAudio(key, wav);
    return new Response(wav, { headers: { ...headers, "X-Audio-Cache": "miss" } });
  },
  { pro: true, practice: true },
);
