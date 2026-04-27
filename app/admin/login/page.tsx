import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { hasAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to the private MaxLoad console.",
};

export default async function AdminLoginPage() {
  if (await hasAdminSession()) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-zinc-100">
      <div className="w-full max-w-md border border-white/10 bg-zinc-950 p-6">
        <div className="mb-6">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
            admin gate
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-white">Enter the console.</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Use the private admin token.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
