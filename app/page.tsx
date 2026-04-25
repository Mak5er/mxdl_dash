import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowDown,
  ArrowUpRight,
  Bot,
  DownloadCloud,
  Gauge,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { ChartCard } from "@/components/ui/ChartCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { BarMetricChart, DonutMetricChart, LineMetricChart } from "@/components/dashboard/Charts";
import { PublicShell } from "@/components/dashboard/PublicShell";
import { formatNumber } from "@/lib/format";
import { getPublicStats } from "@/lib/queries/public-stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "MaxLoad",
  },
  description:
    "Open MaxLoad in Telegram, send a media link, and watch aggregate service stats update as the bot works.",
  alternates: {
    canonical: "/",
  },
};

const botHandle = "maxloadbot";
const botUrl = `https://t.me/${botHandle}`;

const steps = [
  {
    icon: MessageCircle,
    title: "Drop a link",
    text: "Send the bot a media URL or message and keep the flow inside Telegram.",
  },
  {
    icon: Gauge,
    title: "Track the job",
    text: "Processing events feed the dashboard so load and activity stay visible.",
  },
  {
    icon: DownloadCloud,
    title: "Get the file",
    text: "The bot returns a clean download without making users jump across tools.",
  },
];

export default async function PublicDashboardPage() {
  let stats;
  let error: string | null = null;

  try {
    stats = await getPublicStats();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Dashboard data is unavailable.";
  }

  return (
    <PublicShell>
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-20 bg-black" />
        <Image
          src="/maxload-hero.svg"
          alt="Abstract Telegram download flow for maxload"
          fill
          priority
          className="-z-10 object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,0.9)_34%,rgba(0,0,0,0.5)_72%,rgba(0,0,0,0.82)_100%)]" />

        <div className="mx-auto grid min-h-[calc(100svh-92px)] max-w-7xl content-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.92fr_0.68fr] lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 border border-[#229ED9]/40 bg-[#229ED9]/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#8bd9ff]">
              <Bot className="h-4 w-4" />
              Telegram downloader bot
            </div>
            <h1 className="text-5xl font-semibold text-white sm:text-7xl lg:text-8xl">
              MaxLoad
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
              A fast Telegram bot for pulling media into one clean download flow, backed by live public telemetry.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex items-center justify-center gap-2 bg-[#229ED9] px-5 py-3 text-sm font-semibold text-black transition hover:bg-white"
                href={botUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open @{botHandle}
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                className="inline-flex items-center justify-center gap-2 border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white hover:text-black"
                href="#live-stats"
              >
                View live stats
                <ArrowDown className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-zinc-400">
              <span className="border border-white/10 bg-black/50 px-3 py-2">Fast</span>
              <span className="border border-white/10 bg-black/50 px-3 py-2">Secure</span>
              <span className="border border-white/10 bg-black/50 px-3 py-2">Reliable</span>
            </div>
          </div>

          <div className="self-end border border-white/10 bg-black/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  service status
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {error ? "Telemetry offline" : "Operational"}
                </div>
              </div>
              <StatusPill tone={error ? "warn" : "ok"}>{error ? "Check DB" : "Live"}</StatusPill>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                  downloads
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {formatNumber(stats?.totals.downloads)}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                  users
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {formatNumber(stats?.totals.users)}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                  events
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {formatNumber(stats?.totals.events)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.7fr_1fr] lg:px-8">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
            how it works
          </div>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold text-white sm:text-4xl">
            Telegram in, download out.
          </h2>
          <p className="mt-4 max-w-xl text-zinc-400">
            Built for quick saves, repeat use, and enough observability to know the service is moving.
          </p>
        </div>
        <div className="grid gap-px border border-white/10 bg-white/10 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="bg-black p-5">
              <step.icon className="h-5 w-5 text-[#229ED9]" />
              <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-500">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {error ? (
        <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="border border-white/10 bg-black p-4 text-sm text-zinc-400">
            {error}
          </div>
        </div>
      ) : null}

      <section id="live-stats" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
              public telemetry
            </div>
            <h2 className="mt-2 text-3xl font-semibold text-white">Live service stats</h2>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-zinc-500">
            <ShieldCheck className="h-4 w-4" />
            Aggregated only, no private user records.
          </div>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <MetricCard label="Total downloads" value={formatNumber(stats?.totals.downloads)} />
          <MetricCard label="Total users" value={formatNumber(stats?.totals.users)} />
          <MetricCard label="Analytics events" value={formatNumber(stats?.totals.events)} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Downloads by date" eyebrow="30 days">
            <LineMetricChart data={stats?.downloadsByDate ?? []} />
          </ChartCard>
          <ChartCard title="Activity over time" eyebrow="events">
            <LineMetricChart data={stats?.activityOverTime ?? []} />
          </ChartCard>
          <ChartCard title="Downloads by file type">
            <DonutMetricChart data={stats?.downloadsByFileType ?? []} />
          </ChartCard>
          <ChartCard title="Top actions">
            <BarMetricChart data={stats?.topActions ?? []} />
          </ChartCard>
        </section>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border border-white/10 bg-black p-5 text-sm text-zinc-400">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              ready
            </div>
            <div className="mt-2 text-xl font-semibold text-white">Start with @{botHandle} in Telegram.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              className="inline-flex items-center gap-2 bg-white px-4 py-2 font-semibold text-black hover:bg-[#229ED9]"
              href={botUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open bot
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
