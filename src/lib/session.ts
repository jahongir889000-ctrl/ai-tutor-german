import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/** The signed-in user's DB row, or null. Deduped per request. */
export const getCurrentUser = cache(async () => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  return db.user.findUnique({ where: { id } });
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** For pages: redirect to login (or onboarding) when needed. */
export async function requireUser(opts: { allowNotOnboarded?: boolean } = {}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.onboarded && !opts.allowNotOnboarded) redirect("/onboarding");
  return user;
}
