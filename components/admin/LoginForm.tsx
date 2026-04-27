"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token }),
        });

        setLoading(false);

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          setError(data?.error ?? "Login failed.");
          return;
        }

        router.push("/admin");
        router.refresh();
      }}
    >
      <label className="block">
        <span className="font-mono text-sm uppercase tracking-[0.16em] text-zinc-500">
          Admin token
        </span>
        <input
          className="mt-2 min-h-11 w-full border border-white/10 bg-black px-3 py-3 font-mono text-base text-white outline-none placeholder:text-zinc-700 focus:border-white/40 sm:text-sm"
          type="password"
          autoComplete="current-password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="paste admin token"
          required
        />
      </label>
      {error ? <div className="text-sm text-zinc-300">{error}</div> : null}
      <button
        type="submit"
        disabled={loading}
        className="min-h-11 w-full border border-white bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Verifying..." : "Enter console"}
      </button>
    </form>
  );
}
