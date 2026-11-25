import { ChatWindow, type ChatMsg } from "@/components/practice/chat-window";
import { PracticeHeader } from "@/components/practice/practice-header";
import { PracticeSession } from "@/components/usage/practice-session";
import { getI18n } from "@/i18n/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function ChatPage() {
  const [user, { t }] = await Promise.all([requireUser(), getI18n()]);
  const rows = await db.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const initial: ChatMsg[] = rows.reverse().map((r) => ({ role: r.role === "user" ? "user" : "model", text: r.content }));

  return (
    <PracticeSession>
      <div className="mx-auto max-w-3xl space-y-6">
        <PracticeHeader title={t.practice.chat.title} text={t.practice.chat.text} backLabel={t.nav.practice} />
        <ChatWindow initial={initial} />
      </div>
    </PracticeSession>
  );
}
