import Link from "next/link";
import { GitBranch } from "lucide-react";
import { RefreshControl } from "@/components/dashboard/RefreshControl";
import { StatusPill } from "@/components/ui/StatusPill";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const refreshInterval = Number(process.env.PUBLIC_DASHBOARD_AUTO_REFRESH_SECONDS ?? 30);

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <header className="border-b border-white/10 bg-black/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="font-mono text-sm font-semibold uppercase tracking-[0.2em]">
            MaxLoad
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-2">
            <RefreshControl
              intervalSeconds={Number.isFinite(refreshInterval) && refreshInterval > 0 ? refreshInterval : 30}
            />
            <StatusPill className="h-8 px-2 text-[10px] tracking-[0.12em]">Live</StatusPill>
            <a
              className="inline-flex h-8 w-8 items-center justify-center border border-white/10 bg-zinc-950/50 text-zinc-500 transition hover:border-white/30 hover:text-white"
              href="https://github.com/Mak5er/Downloader-Bot"
              target="_blank"
              rel="noreferrer"
              title="GitHub repository"
              aria-label="GitHub repository"
            >
              <GitBranch className="h-3.5 w-3.5" />
            </a>
          </nav>
        </div>
      </header>
      {children}
    </main>
  );
}
