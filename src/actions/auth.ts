"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { cookies } from "next/headers";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { safeTimeZone } from "@/lib/usage-window";
import { LOCALE_COOKIE, isLocale } from "@/i18n";

export type AuthState = { error?: "invalid" | "exists" | "invalidForm" };

const registerSchema = z.object({
  name: z.string().trim().min(1).max(60),
  email: z.email(),
  password: z.string().min(6).max(128),
  timezone: z.string().optional(),
});

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "invalidForm" };
  const email = parsed.data.email.toLowerCase();

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "exists" };

  const locale = (await cookies()).get(LOCALE_COOKIE)?.value;
  await db.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      timezone: safeTimeZone(parsed.data.timezone),
      locale: isLocale(locale) ? locale : "ru",
    },
  });

  return doSignIn(email, parsed.data.password, "/onboarding");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const tz = formData.get("timezone");
  const user = await db.user.findUnique({ where: { email }, select: { id: true, timezone: true } });
  // keep the stored timezone in sync with the browser if it was never set
  if (user && user.timezone === "UTC" && typeof tz === "string" && tz) {
    await db.user.update({ where: { id: user.id }, data: { timezone: safeTimeZone(tz) } });
  }
  return doSignIn(email, password, "/dashboard");
}

async function doSignIn(email: string, password: string, redirectTo: string): Promise<AuthState> {
  try {
    await signIn("credentials", { email, password, redirectTo });
    return {};
  } catch (err) {
    if (err instanceof AuthError) return { error: "invalid" };
    throw err; // NEXT_REDIRECT
  }
}

export async function googleSignIn() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
