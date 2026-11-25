import { z } from "zod";
import { guarded, readJson } from "@/lib/api";
import { streamText } from "@/lib/ai/gemini";
import { CHAT_TASK, tutorSystem } from "@/lib/ai/prompts";
import { targetLevel, topicForUser, userLocale } from "@/lib/access";
import { db } from "@/lib/db";

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "model"]), text: z.string().min(1).max(2000) }))
    .min(1)
    .max(40),
  topicId: z.string().nullish(),
});

export const POST = guarded(
  async (req, user) => {
    const { messages, topicId } = await readJson(req, (v) => bodySchema.parse(v));
    const topic = topicForUser(user, topicId);
    const last = messages[messages.length - 1];

    const stream = await streamText({
      system: tutorSystem({ levelId: targetLevel(user, topic), locale: userLocale(user), topicId: topic?.id }, CHAT_TASK),
      contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    });

    const encoder = new TextEncoder();
    let full = "";
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
              full += text;
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
          if (last.role === "user") {
            await db.chatMessage.createMany({
              data: [
                { userId: user.id, role: "user", content: last.text },
                { userId: user.id, role: "model", content: full },
              ],
            });
          }
        } catch (err) {
          console.error(err);
          controller.error(err);
        }
      },
    });

    return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  },
  { practice: true },
);

/** Clear chat history. */
export const DELETE = guarded(async (_req, user) => {
  await db.chatMessage.deleteMany({ where: { userId: user.id } });
  return new Response(null, { status: 204 });
});
