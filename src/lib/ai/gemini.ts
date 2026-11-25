import "server-only";
import { GoogleGenAI, type ContentListUnion } from "@google/genai";
import { z } from "zod";
import { HttpError } from "@/lib/api";

export const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
export const TTS_MODEL = process.env.GEMINI_TTS_MODEL ?? "gemini-2.5-flash-preview-tts";

let client: GoogleGenAI | null = null;

export function genai(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) throw new HttpError(500, "ai_not_configured", "GEMINI_API_KEY is not set");
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

function jsonSchemaOf(schema: z.ZodType) {
  const js = z.toJSONSchema(schema) as Record<string, unknown>;
  delete js.$schema;
  return js;
}

/** Structured output: the model answers with JSON matching the zod schema. */
export async function generateJson<T>(
  schema: z.ZodType<T>,
  opts: { system: string; contents: ContentListUnion; temperature?: number },
): Promise<T> {
  const res = await genai().models.generateContent({
    model: MODEL,
    contents: opts.contents,
    config: {
      systemInstruction: opts.system,
      temperature: opts.temperature ?? 0.7,
      responseMimeType: "application/json",
      responseJsonSchema: jsonSchemaOf(schema),
    },
  });
  const text = res.text;
  if (!text) throw new HttpError(502, "ai_empty", "Empty response from model");
  try {
    return schema.parse(JSON.parse(text));
  } catch {
    throw new HttpError(502, "ai_bad_output", "The model returned an unexpected format");
  }
}

/** Streams plain text chunks from the model. */
export async function streamText(opts: { system: string; contents: ContentListUnion; temperature?: number }) {
  const stream = await genai().models.generateContentStream({
    model: MODEL,
    contents: opts.contents,
    config: { systemInstruction: opts.system, temperature: opts.temperature ?? 0.8 },
  });
  return stream;
}

// ---------- Text to speech ----------

type Voice = "Kore" | "Puck" | "Charon" | "Aoede" | "Fenrir" | "Leda";

/**
 * Synthesises German speech. Pass `speakers` for a two-voice dialogue where each line of
 * `text` starts with "Name: ".
 */
export async function synthesizeSpeech(
  text: string,
  opts: { voice?: Voice; speakers?: { name: string; voice: Voice }[] } = {},
): Promise<{ base64: string; mimeType: "audio/wav" }> {
  const speechConfig = opts.speakers?.length
    ? {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: opts.speakers.map((s) => ({
            speaker: s.name,
            voiceConfig: { prebuiltVoiceConfig: { voiceName: s.voice } },
          })),
        },
      }
    : { voiceConfig: { prebuiltVoiceConfig: { voiceName: opts.voice ?? "Kore" } } };

  const prompt = opts.speakers?.length
    ? `TTS the following German conversation naturally, at a clear learner-friendly pace:\n${text}`
    : `Say clearly in standard German, at a learner-friendly pace: ${text}`;

  const res = await genai().models.generateContent({
    model: TTS_MODEL,
    contents: prompt,
    config: { responseModalities: ["AUDIO"], speechConfig },
  });

  const part = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  const data = part?.inlineData?.data;
  if (!data) throw new HttpError(502, "tts_empty", "No audio returned");
  const mime = part?.inlineData?.mimeType ?? "";
  if (mime.includes("wav")) return { base64: data, mimeType: "audio/wav" };
  const rate = Number(/rate=(\d+)/.exec(mime)?.[1] ?? 24000);
  return { base64: pcmToWav(Buffer.from(data, "base64"), rate).toString("base64"), mimeType: "audio/wav" };
}

/** Wraps raw 16-bit mono PCM in a WAV container. */
function pcmToWav(pcm: Buffer, sampleRate: number, channels = 1, bitsPerSample = 16): Buffer {
  const blockAlign = (channels * bitsPerSample) / 8;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * blockAlign, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}
