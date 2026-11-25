import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { BUCKET, deleteObject, getObject, putObject, signedUrl, storageEnabled } from "@/lib/storage";

/**
 * Round-trips every backing service: Postgres (query) and Neon Object Storage
 * (upload → download → presigned GET → delete). Open in development; in production it
 * requires `Authorization: Bearer $HEALTHCHECK_TOKEN`.
 */
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    const token = process.env.HEALTHCHECK_TOKEN;
    if (!token || req.headers.get("authorization") !== `Bearer ${token}`) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
  }

  const result: Record<string, unknown> = {};

  try {
    const [row] = await db.$queryRaw<{ now: Date; version: string }[]>`select now() as now, version() as version`;
    const users = await db.user.count();
    result.postgres = { ok: true, serverTime: row.now, version: row.version.split(" ").slice(0, 2).join(" "), users };
  } catch (err) {
    result.postgres = { ok: false, error: (err as Error).message };
  }

  if (!storageEnabled()) {
    result.storage = { ok: false, error: "AWS_* env vars are not set" };
  } else {
    const key = `healthcheck/${randomUUID()}.txt`;
    const payload = `deutschmentor ${new Date().toISOString()}`;
    try {
      await putObject(key, payload, "text/plain");
      const roundTrip = new TextDecoder().decode(await getObject(key));
      const url = await signedUrl(key, 60);
      const viaUrl = await fetch(url).then((r) => r.text());
      await deleteObject(key);
      result.storage = {
        ok: roundTrip === payload && viaUrl === payload,
        bucket: BUCKET,
        upload: true,
        download: roundTrip === payload,
        presignedGet: viaUrl === payload,
        deleted: true,
      };
    } catch (err) {
      result.storage = { ok: false, error: (err as Error).message };
    }
  }

  const ok = Object.values(result).every((r) => (r as { ok: boolean }).ok);
  return NextResponse.json({ ok, ...result }, { status: ok ? 200 : 503 });
}
