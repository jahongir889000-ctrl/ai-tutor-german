"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useBrowserTimezone } from "@/hooks/use-browser-timezone";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { googleSignIn, loginAction, registerAction, type AuthState } from "@/actions/auth";
import { useI18n } from "@/i18n/client";

export function AuthForm({ mode, googleEnabled }: { mode: "login" | "register"; googleEnabled: boolean }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<AuthState, FormData>(
    mode === "login" ? loginAction : registerAction,
    {},
  );
  const tz = useBrowserTimezone();

  const isLogin = mode === "login";
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>
          <h1 className="text-5xl">{isLogin ? t.auth.loginTitle : t.auth.registerTitle}</h1>
        </CardTitle>
        <CardDescription>{isLogin ? t.auth.loginText : t.auth.registerText}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {googleEnabled && (
          <>
            <form action={googleSignIn}>
              <Button type="submit" variant="outline" className="w-full">
                <GoogleIcon /> {t.auth.google}
              </Button>
            </form>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Separator className="flex-1" /> {t.auth.or} <Separator className="flex-1" />
            </div>
          </>
        )}
        <form action={action} className="space-y-4">
          <input type="hidden" name="timezone" value={tz} />
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">{t.auth.name}</Label>
              <Input id="name" name="name" required maxLength={60} autoComplete="name" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t.auth.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            {!isLogin && <p className="text-xs text-muted-foreground">{t.auth.passwordHint}</p>}
          </div>
          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {t.auth[state.error]}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            {isLogin ? t.auth.submitLogin : t.auth.submitRegister}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        {isLogin ? t.auth.noAccount : t.auth.haveAccount}{" "}
        <Link href={isLogin ? "/register" : "/login"} className="ml-1 text-foreground underline">
          {isLogin ? t.nav.register : t.nav.login}
        </Link>
      </CardFooter>
    </Card>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.8 3.6-4.9 6.7-4.9z" />
    </svg>
  );
}
