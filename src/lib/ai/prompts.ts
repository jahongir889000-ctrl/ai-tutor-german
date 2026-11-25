import { getLevel, getTopic, type Locale } from "@/content/curriculum";

const LANG: Record<Locale, string> = { ru: "Russian", en: "English" };

export interface TutorContext {
  levelId: string;
  locale: Locale;
  topicId?: string | null;
}

export function describeContext({ levelId, locale, topicId }: TutorContext) {
  const level = getLevel(levelId);
  const topic = topicId ? getTopic(topicId) : undefined;
  return [
    `Learner level: CEFR ${level?.code ?? "A1"} (${level?.title.en ?? ""}).`,
    `Learner's interface language: ${LANG[locale]}. Write all explanations, translations and feedback in ${LANG[locale]}; German content stays German.`,
    topic
      ? `Current topic: "${topic.titleDe}" (${topic.title.en}). Grammar focus: ${topic.grammar.title.en} — ${topic.grammar.rule.en}. Key words: ${topic.words.map((w) => w.de).join(", ")}.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function tutorSystem(ctx: TutorContext, task: string) {
  return `You are DeutschMentor, a warm, patient and precise personal German tutor.
${describeContext(ctx)}
Always match vocabulary and grammar complexity to the learner's level. Use standard German (Hochdeutsch) unless asked otherwise. Be concise.

Task: ${task}`;
}

export const CHAT_TASK = `Hold a conversation in German with the learner.
- Reply in simple German appropriate to the level (2-4 sentences) and end with a question to keep the dialogue going.
- If the learner's last message has mistakes, start your reply with a short correction block:
  "✏️ <corrected sentence>" followed by a one-line explanation in the interface language.
- If the learner writes in their interface language or asks about grammar, answer in the interface language with German examples.
- Use **bold** for key German words. Never be condescending.`;
