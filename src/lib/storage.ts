import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";

/**
 * Neon Object Storage (S3-compatible), private bucket declared in neon.ts.
 * Credentials, endpoint and region come from the AWS_* env vars that `neon deploy` pulls.
 * Keys are stored, presigned URLs are minted on read.
 */
export const BUCKET = "uploads";

let files: Files | null = null;

export function storageEnabled() {
  return Boolean(process.env.AWS_ENDPOINT_URL_S3 && process.env.AWS_ACCESS_KEY_ID);
}

function client(): Files {
  files ??= new Files({ adapter: neon({ bucket: BUCKET, defaultUrlExpiresIn: 3600 }) });
  return files;
}

export async function putObject(key: string, body: Buffer | string, contentType: string) {
  await client().upload(key, body, { contentType });
  return key;
}

export async function putAudio(key: string, wav: Buffer) {
  return putObject(key, wav, "audio/wav");
}

export async function audioExists(key: string) {
  return client().exists(key);
}

export async function signedUrl(key: string, expiresIn = 3600) {
  return client().url(key, { expiresIn });
}

export async function getObject(key: string): Promise<Uint8Array> {
  const file = await client().download(key);
  return new Uint8Array(await file.arrayBuffer());
}

export async function deleteObject(key: string) {
  await client().delete(key);
}

/** Content-addressed key for TTS audio, so identical phrases are synthesised once. */
export function ttsKey(text: string, voice = "default") {
  const hash = createHash("sha256").update(`${voice}\n${text}`).digest("hex").slice(0, 32);
  return `tts/${hash}.wav`;
}

export function listeningKey(userId: string) {
  return `listening/${userId}/${randomUUID()}.wav`;
}
