import Link from "next/link";
import { Brain, Headphones, Languages, MessageCircle, Mic, Speech } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProBadge } from "@/components/pro-gate";
import { getI18n } from "@/i18n/server";
import { isPro } from "@/lib/plans";
import { requireUser } from "@/lib/session";

export default async function PracticeHub() {
  const [user, { t }] = await Promise.all([requireUser(), getI18n()]);
  const pro = isPro(user);
  const items = [
    { href: "/practice/chat", icon: MessageCircle, ...t.practice.chat, pro: false },
    { href: "/practice/quiz", icon: Brain, ...t.practice.quiz, pro: false },
    { href: "/practice/vocab", icon: Languages, ...t.practice.vocab, pro: false },
    { href: "/practice/speaking", icon: Speech, ...t.practice.speaking, pro: true },
    { href: "/practice/pronunciation", icon: Mic, ...t.practice.pronunciation, pro: true },
    { href: "/practice/listening", icon: Headphones, ...t.practice.listening, pro: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-6xl text-primary">{t.practice.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.practice.text}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ href, icon: Icon, title, text, pro: needsPro }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="grid size-11 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                    <Icon className="size-5" />
                  </div>
                  {needsPro && !pro && <ProBadge />}
                </div>
                <p className="font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{text}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
