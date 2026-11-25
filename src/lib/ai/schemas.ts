import { z } from "zod";

export const quizSchema = z.object({
  questions: z
    .array(
      z.object({
        type: z.enum(["choice", "fill", "translate"]),
        prompt: z.string().describe("Question text. For 'fill' use ___ for the gap."),
        options: z.array(z.string()).describe("4 options for 'choice', empty array otherwise"),
        answer: z.string().describe("The correct answer"),
        explanation: z.string().describe("Short explanation in the learner's interface language"),
      }),
    )
    .min(3)
    .max(10),
});
export type Quiz = z.infer<typeof quizSchema>;

export const grammarSchema = z.object({
  title: z.string(),
  explanation: z.string().describe("Clear explanation in the learner's interface language, 3-6 sentences"),
  examples: z.array(z.object({ de: z.string(), translation: z.string() })).min(2).max(6),
  tips: z.array(z.string()).max(4),
});
export type GrammarExplanation = z.infer<typeof grammarSchema>;

export const vocabSchema = z.object({
  words: z
    .array(
      z.object({
        de: z.string().describe("German word; nouns with article, e.g. 'der Tisch'"),
        translation: z.string(),
        example: z.string().describe("Short German example sentence"),
        exampleTranslation: z.string(),
      }),
    )
    .min(4)
    .max(12),
});
export type VocabList = z.infer<typeof vocabSchema>;

export const mistakeItem = z.object({
  type: z.enum(["GRAMMAR", "VOCABULARY", "SPELLING"]),
  original: z.string(),
  correction: z.string(),
  explanation: z.string(),
});

export const checkSchema = z.object({
  correct: z.boolean(),
  corrected: z.string().describe("Fully corrected German text"),
  summary: z.string().describe("One or two encouraging sentences of feedback"),
  mistakes: z.array(mistakeItem),
});
export type CheckResult = z.infer<typeof checkSchema>;

export const taskSchema = z.object({
  instruction: z.string().describe("Task in the learner's interface language"),
  hint: z.string(),
});

export const mistakesReportSchema = z.object({
  summary: z.string(),
  focusAreas: z.array(z.object({ title: z.string(), explanation: z.string() })).max(5),
  drills: z.array(z.object({ prompt: z.string(), answer: z.string() })).max(8),
});
export type MistakesReport = z.infer<typeof mistakesReportSchema>;

export const phraseSchema = z.object({
  phrase: z.string().describe("A German sentence for reading aloud"),
  translation: z.string(),
  focus: z.string().describe("Which sounds this phrase trains, e.g. ü, ch, r"),
});

export const pronunciationSchema = z.object({
  transcript: z.string().describe("What the learner actually said"),
  score: z.number().min(0).max(100),
  feedback: z.string(),
  words: z.array(z.object({ word: z.string(), score: z.number().min(0).max(100) })),
  sounds: z.array(z.object({ sound: z.string(), issue: z.string(), tip: z.string() })).max(5),
});
export type PronunciationResult = z.infer<typeof pronunciationSchema>;

export const speakingSchema = z.object({
  transcript: z.string(),
  corrections: z.array(z.object({ original: z.string(), correction: z.string(), explanation: z.string() })),
  reply: z.string().describe("Tutor's spoken reply in German, ending with a follow-up question"),
  fluency: z.number().min(0).max(100),
});
export type SpeakingResult = z.infer<typeof speakingSchema>;

export const listeningSchema = z.object({
  title: z.string(),
  speakers: z.array(z.string()).length(2).describe("Two German first names"),
  lines: z.array(z.object({ speaker: z.string(), text: z.string() })).min(4).max(12),
  questions: z
    .array(z.object({ question: z.string(), options: z.array(z.string()).length(3), answer: z.string() }))
    .min(3)
    .max(5),
});
export type ListeningExercise = z.infer<typeof listeningSchema>;
