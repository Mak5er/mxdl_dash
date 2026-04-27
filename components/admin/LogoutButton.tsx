"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      title="Logout"
      aria-label="Logout"
      className="inline-flex h-11 w-11 items-center justify-center border border-white/10 text-zinc-400 hover:border-white/30 hover:text-white disabled:opacity-60"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
