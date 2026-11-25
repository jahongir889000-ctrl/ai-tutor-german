import { NextResponse } from "next/server";
import { guarded, HttpError } from "@/lib/api";
import { generateJson } from "@/lib/ai/gemini";
import { tutorSystem } from "@/lib/ai/prompts";
import { mistakesReportSchema } from "@/lib/ai/schemas";
import { userLocale } from "@/lib/access";
import { db } from "@/lib/db";

/** Pro: analyse the learner's recent mistakes and build a personal plan with drills. */
export const POST = guarded(
  async (_req, user) => {
    const mistakes = await db.mistake.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 60,
    });
    if (!mistakes.length) throw new HttpError(400, "no_mistakes");

    const list = mistakes
      .map((m, i) => `${i + 1}. [${m.type}] "${m.original}" → "${m.correction}" (${m.explanation})`)
      .join("\n");

    const report = await generateJson(mistakesReportSchema, {
      system: tutorSystem(
        { levelId: user.currentLevel, locale: userLocale(user) },
        `Analyse the learner's mistake log. Identify recurring patterns (not single slips), explain the underlying rule for each
focus area in the interface language, and create short drills (German prompt + answer) targeting exactly those patterns.`,
      ),
      contents: list,
      temperature: 0.4,
    });
    return NextResponse.json(report);
  },
  { pro: true, practice: true },
);
