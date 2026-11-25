import { NextResponse } from "next/server";
import { z } from "zod";
import { guarded, readJson } from "@/lib/api";
import { getUsageStatus, recordHeartbeat } from "@/lib/usage";

export const GET = guarded(async (_req, user) => {
  return NextResponse.json(serialize(await getUsageStatus(user)));
});

const beatSchema = z.object({ seconds: z.number().min(0).max(60) });

/** Heartbeat: the client reports active practice seconds since the last beat. */
export const POST = guarded(async (req, user) => {
  const { seconds } = await readJson(req, (v) => beatSchema.parse(v));
  return NextResponse.json(serialize(await recordHeartbeat(user, seconds)));
});

function serialize(s: Awaited<ReturnType<typeof getUsageStatus>>) {
  // JSON can't carry Infinity
  return { ...s, remainingSeconds: s.unlimited ? null : s.remainingSeconds };
}
