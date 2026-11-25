import "server-only";
import { HttpError } from "@/lib/api";

const MAX_AUDIO_BYTES = 6 * 1024 * 1024;
const ALLOWED = ["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav", "audio/x-wav", "audio/aac"];

/** Reads an uploaded recording from multipart form data as base64 for Gemini inline data. */
export async function readAudio(form: FormData, field = "audio") {
  const file = form.get(field);
  if (!(file instanceof File)) throw new HttpError(400, "audio_missing");
  if (file.size === 0) throw new HttpError(400, "audio_empty");
  if (file.size > MAX_AUDIO_BYTES) throw new HttpError(413, "audio_too_large");
  const mimeType = (file.type || "audio/webm").split(";")[0];
  if (!ALLOWED.includes(mimeType)) throw new HttpError(415, "audio_unsupported");
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  return { base64, mimeType };
}

export async function readForm(req: Request) {
  try {
    return await req.formData();
  } catch {
    throw new HttpError(400, "bad_form");
  }
}
