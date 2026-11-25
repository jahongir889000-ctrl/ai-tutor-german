import { PracticeHeader } from "@/components/practice/practice-header";
import { SpeakingCoach } from "@/components/practice/speaking-coach";
import { ProGate } from "@/components/pro-gate";
import { PracticeSession } from "@/components/usage/practice-session";
import { getI18n } from "@/i18n/server";
import { isPro } from "@/lib/plans";
import { requireUser } from "@/lib/session";

export default async function SpeakingPage() {
  const [user, { t }] = await Promise.all([requireUser(), getI18n()]);
  const pro = isPro(user);
  return (
    <div className="space-y-8">
      <PracticeHeader title={t.practice.speaking.title} text={t.practice.speaking.text} backLabel={t.nav.practice} pro />
      {pro ? (
        <PracticeSession>
          <SpeakingCoach />
        </PracticeSession>
      ) : (
        <ProGate t={t} />
      )}
    </div>
  );
}
