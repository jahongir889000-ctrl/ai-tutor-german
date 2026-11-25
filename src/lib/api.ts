import "server-only";
import { NextResponse } from "next/server";
import { getCurrentUser, type CurrentUser } from "@/lib/session";
import { isPro } from "@/lib/plans";
import { getUsageStatus } from "@/lib/usage";

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

interface GuardOptions {
  /** Requires an active Pro subscription. */
  pro?: boolean;
  /** Counts as practice: blocked when the free daily time is used up. */
  practice?: boolean;
}

type Handler = (req: Request, user: CurrentUser) => Promise<Response>;

/** Wraps a route handler with auth, plan and daily-limit checks plus error handling. */
export function guarded(handler: Handler, opts: GuardOptions = {}) {
  return async (req: Request) => {
    try {
      const user = await getCurrentUser();
      if (!user) throw new HttpError(401, "unauthorized");
      if (opts.pro && !isPro(user)) throw new HttpError(402, "pro_required");
      if (opts.practice && !isPro(user)) {
        const usage = await getUsageStatus(user);
        if (usage.remainingSeconds <= 0) throw new HttpError(429, "daily_limit");
      }
      return await handler(req, user);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export function errorResponse(err: unknown) {
  if (err instanceof HttpError) {
    return NextResponse.json({ error: err.code, message: err.message }, { status: err.status });
  }
  console.error(err);
  const message = err instanceof Error ? err.message : "Internal error";
  return NextResponse.json({ error: "internal", message }, { status: 500 });
}

export async function readJson<T>(req: Request, parse: (v: unknown) => T): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "bad_json");
  }
  try {
    return parse(body);
  } catch {
    throw new HttpError(400, "bad_request");
  }
}
