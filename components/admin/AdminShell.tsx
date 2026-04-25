import Link from "next/link";
import { Database, Download, LayoutDashboard, Users, Activity } from "lucide-react";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { RefreshControl } from "@/components/dashboard/RefreshControl";
import { StatusPill } from "@/components/ui/StatusPill";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/downloads", label: "Downloads", icon: Download },
  { href: "/admin/events", label: "Events", icon: Activity },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const refreshInterval = Number(process.env.ADMIN_DASHBOARD_AUTO_REFRESH_SECONDS ?? 10);

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <header className="border-b border-white/10 bg-black/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center border border-white/10 bg-white text-black">
              <Database className="h-4 w-4" />
            </span>
            <div>
              <Link
                href="/admin"
                className="font-mono text-sm font-semibold uppercase tracking-[0.2em]"
              >
                MaxLoad
              </Link>
              <div className="text-xs text-zinc-500">Admin</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <RefreshControl
              intervalSeconds={Number.isFinite(refreshInterval) && refreshInterval > 0 ? refreshInterval : 10}
            />
            <StatusPill tone="warn">Private</StatusPill>
            <LogoutButton />
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-sm text-zinc-400 hover:border-white/30 hover:text-white"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}
