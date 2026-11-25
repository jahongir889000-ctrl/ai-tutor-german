import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { getI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/session";

export async function SiteHeader() {
  const [{ t }, user] = await Promise.all([getI18n(), getCurrentUser()]);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/pricing">{t.nav.pricing}</Link>
          </Button>
          <LocaleSwitcher />
          <ThemeToggle />
          {user ? (
            <Button asChild size="sm">
              <Link href="/dashboard">{t.nav.dashboard}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{t.nav.login}</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/register">{t.nav.getStarted}</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export async function SiteFooter() {
  const { t } = await getI18n();
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row">
        <span>
          © {new Date().getFullYear()} {t.common.appName} — {t.common.tagline}
        </span>
        <Link href="/pricing" className="hover:underline">
          {t.nav.pricing}
        </Link>
      </div>
    </footer>
  );
}
