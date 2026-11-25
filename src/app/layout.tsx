import type { Metadata } from "next";
import { Geist_Mono, Great_Vibes } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/i18n/client";
import { getLocale } from "@/i18n/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  weight: "400",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

export const metadata: Metadata = {
  title: { default: "DeutschMentor — AI German tutor", template: "%s · DeutschMentor" },
  description:
    "Персональный AI-репетитор немецкого языка: уроки A1–C2, квизы, speaking, listening и проверка произношения.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistMono.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <I18nProvider locale={locale}>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster richColors position="top-center" />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
