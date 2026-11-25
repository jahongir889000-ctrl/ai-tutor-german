import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { googleEnabled } from "@/auth";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Вход" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 py-12">
      <AuthForm mode="login" googleEnabled={googleEnabled} />
    </div>
  );
}
