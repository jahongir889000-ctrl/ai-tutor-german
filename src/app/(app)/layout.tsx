import { AppNav } from "@/components/app-nav";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { UsageMeter } from "@/components/usage/usage-meter";
import { UsageProvider } from "@/components/usage/usage-provider";
import { isPro } from "@/lib/plans";
import { requireUser } from "@/lib/session";
import { getUsageStatus } from "@/lib/usage";
import type { UsageDTO } from "@/lib/format";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser({ allowNotOnboarded: true });
  const status = await getUsageStatus(user);
  const usage: UsageDTO = {
    ...status,
    remainingSeconds: status.unlimited ? null : status.remainingSeconds,
  };

  return (
    <UsageProvider initial={usage}>
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
          <Logo href="/dashboard" className="shrink-0" />
          {user.onboarded && <AppNav />}
          <div className="flex items-center gap-1">
            <UsageMeter className="hidden sm:flex" />
            <LocaleSwitcher />
            <ThemeToggle />
            <UserMenu name={user.name ?? ""} email={user.email} image={user.image} pro={isPro(user)} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </UsageProvider>
  );
}
