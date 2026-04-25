import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { BarMetricChart, DonutMetricChart, LineMetricChart } from "@/components/dashboard/Charts";
import { ChartCard } from "@/components/ui/ChartCard";
import { DataTable } from "@/components/ui/DataTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { hasAdminSession } from "@/lib/auth";
import { formatDateTime, formatNumber } from "@/lib/format";
import { getAdminStats } from "@/lib/queries/admin-stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "MaxLoad | Admin",
  },
  description: "Private MaxLoad operations overview.",
};

export default async function AdminOverviewPage() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  let stats;
  let error: string | null = null;

  try {
    stats = await getAdminStats();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Admin data is unavailable.";
  }

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
            overview
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-white">Operational console</h1>
        </div>
        <div className="text-sm text-zinc-500">
          Last updated: {stats ? formatDateTime(stats.lastUpdated) : "Not available"}
        </div>
      </div>

      {error ? (
        <div className="mb-6 border border-white/10 bg-black p-4 text-sm text-zinc-400">
          {error}
        </div>
      ) : null}

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <MetricCard label="Users" value={formatNumber(stats?.counts.totalUsers)} detail="New user dates unavailable in schema" />
        <MetricCard label="Downloads" value={formatNumber(stats?.counts.totalDownloads)} detail={`${formatNumber(stats?.counts.downloadsToday)} today / ${formatNumber(stats?.counts.downloads7d)} 7d / ${formatNumber(stats?.counts.downloads30d)} 30d`} />
        <MetricCard label="Events" value={formatNumber(stats?.counts.totalEvents)} detail={`${formatNumber(stats?.counts.eventsToday)} today / ${formatNumber(stats?.counts.events7d)} 7d / ${formatNumber(stats?.counts.events30d)} 30d`} />
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Events over time" eyebrow="30 days">
          <LineMetricChart data={stats?.eventsOverTime ?? []} />
        </ChartCard>
        <ChartCard title="Top actions">
          <BarMetricChart data={stats?.topActions ?? []} />
        </ChartCard>
        <ChartCard title="Chat types">
          <DonutMetricChart data={stats?.chatTypes ?? []} />
        </ChartCard>
        <ChartCard title="File types">
          <DonutMetricChart data={stats?.fileTypes ?? []} />
        </ChartCard>
      </section>

      <section>
        <ChartCard title="Recent activity">
          <DataTable
            columns={["Time", "User", "Action"]}
            rows={(stats?.recentActivity ?? []).map((event) => [
              formatDateTime(event.createdAt),
              <Link className="text-white hover:underline" href={`/admin/users/${event.userId}`} key="user">
                {event.userId}
              </Link>,
              event.actionName,
            ])}
          />
        </ChartCard>
      </section>
    </AdminShell>
  );
}
