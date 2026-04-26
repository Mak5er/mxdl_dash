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
import { formatActionLabel, formatNumber } from "@/lib/format";
import { getPublicStats } from "@/lib/queries/public-stats";
import {
  botHandle,
  botUrl,
  defaultDescription,
  defaultTitle,
  getAbsoluteUrl,
  githubIssuesUrl,
  githubRepositoryUrl,
  jsonLd,
  plainDescription,
  siteName,
  supportUrl,
  supportedPlatforms,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: defaultTitle,
  },
  description: defaultDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MaxLoad Telegram downloader bot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/opengraph-image"],
  },
};

const steps = [
  {
    icon: MessageCircle,
    title: "Send a link",
    text: "Paste a supported video, audio, or post link into Telegram.",
  },
  {
    icon: Gauge,
    title: "Pick a chat",
    text: "Use MaxLoad privately, in a group, or inline.",
  },
  {
    icon: DownloadCloud,
    title: "Get the file",
    text: "The bot sends the result back in Telegram.",
  },
];

const proofPoints = [
  {
    title: "Private chat",
    text: "Use the bot one-on-one when you want a quick download.",
  },
  {
    title: "Group friendly",
    text: "Add it to a group so everyone can send supported links.",
  },
  {
    title: "Simple controls",
    text: "Change captions, buttons, audio options, and cleanup settings.",
  },
];

const platformCards = [
  {
    title: "TikTok videos",
    text: "Send a TikTok link and get the video back in Telegram.",
  },
  {
    title: "Instagram reels and posts",
    text: "Use Instagram links when you want to save a reel or post.",
  },
  {
    title: "YouTube videos",
    text: "Paste a YouTube link and let the bot handle the download flow.",
  },
  {
    title: "SoundCloud tracks",
    text: "Send a SoundCloud link when you need the audio in chat.",
  },
  {
    title: "Pinterest pins",
    text: "Use Pinterest links without leaving Telegram.",
  },
  {
    title: "X / Twitter posts",
    text: "Send a post link and get the media back where you are chatting.",
  },
];

const faqItems = [
  {
    question: "What is MaxLoad?",
    answer:
      "MaxLoad is a Telegram bot that downloads videos, audio, and posts from supported links you send.",
  },
  {
    question: "What links can I send?",
    answer:
      "TikTok, Instagram, YouTube, SoundCloud, Pinterest, and X/Twitter links.",
  },
  {
    question: "Can I add it to a group?",
    answer:
      "Yes. You can use MaxLoad in a private chat, group chat, or inline mode.",
  },
  {
    question: "Do I need to install another app?",
    answer:
      "No. Open the bot in Telegram, send a link, and wait for the file in the same chat.",
  },
  {
    question: "Can MaxLoad download audio?",
    answer:
      "Yes. SoundCloud is supported, and the bot settings include MP3 options when they are available for a link.",
  },
  {
    question: "Can I change the bot settings?",
    answer:
      "Yes. Open the bot settings to change captions, buttons, MP3 options, and auto-delete.",
  },
  {
    question: "Does this page show private data?",
    answer:
      "No. It shows only totals, not who downloaded what.",
  },
  {
    question: "Where do I report a broken source?",
    answer:
      "Message @mak5er on Telegram or open an issue on GitHub with the source that failed.",
  },
];

const pageUrl = getAbsoluteUrl("/");
const imageUrl = getAbsoluteUrl("/opengraph-image");
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": pageUrl ? `${pageUrl}#website` : "#website",
      name: siteName,
      url: pageUrl,
      description: defaultDescription,
      inLanguage: "en",
      sameAs: [botUrl, githubRepositoryUrl],
    },
    {
      "@type": "SoftwareApplication",
      "@id": pageUrl ? `${pageUrl}#app` : "#app",
      name: `${siteName} Telegram Bot`,
      alternateName: siteName,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Telegram",
      description: plainDescription,
      url: pageUrl,
      sameAs: [botUrl, githubRepositoryUrl],
      potentialAction: {
        "@type": "UseAction",
        name: `Open @${botHandle}`,
        target: botUrl,
      },
    },
    {
      "@type": "WebPage",
      "@id": pageUrl ? `${pageUrl}#webpage` : "#webpage",
      url: pageUrl,
      name: defaultTitle,
      description: defaultDescription,
      isPartOf: {
        "@id": pageUrl ? `${pageUrl}#website` : "#website",
      },
      about: {
        "@id": pageUrl ? `${pageUrl}#app` : "#app",
      },
      primaryImageOfPage: imageUrl
        ? {
            "@type": "ImageObject",
            url: imageUrl,
          }
        : undefined,
      inLanguage: "en",
    },
    {
      "@type": "FAQPage",
      "@id": pageUrl ? `${pageUrl}#faq` : "#faq",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": pageUrl ? `${pageUrl}#breadcrumbs` : "#breadcrumbs",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: siteName,
          item: pageUrl,
        },
      ],
    },
  ],
};

export default async function PublicDashboardPage() {
  let stats;
  let error: string | null = null;

  try {
    stats = await getPublicStats();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Dashboard data is unavailable.";
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
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

        <div className="mx-auto grid min-h-[calc(100svh-92px)] max-w-7xl content-center gap-8 px-4 py-12 sm:gap-10 sm:px-6 sm:py-14 lg:grid-cols-[0.92fr_0.68fr] lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex max-w-full flex-wrap items-center gap-2 border border-[#229ED9]/40 bg-[#229ED9]/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#8bd9ff]">
              <Bot className="h-4 w-4" />
              Telegram downloader bot
            </div>
            <h1 className="text-[2.75rem] leading-none font-semibold text-white sm:text-7xl lg:text-8xl">
              MaxLoad
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-xl sm:leading-8">
              {plainDescription}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex w-full items-center justify-center gap-2 bg-[#229ED9] px-6 py-3 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(34,158,217,0.4)] transition hover:bg-white sm:w-auto"
                href={botUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open @{botHandle}
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                className="inline-flex w-full items-center justify-center gap-2 border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white hover:text-black sm:w-auto"
                href="#live-stats"
              >
                View live stats
                <ArrowDown className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {supportedPlatforms.map((platform) => (
                <span
                  key={platform}
                  className="border border-white/10 bg-black/50 px-3 py-2 text-sm text-zinc-300"
                >
                  {platform}
                </span>
              ))}
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {proofPoints.map((point) => (
                <div key={point.title} className="border border-white/10 bg-black/55 p-4">
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8bd9ff]">
                    {point.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{point.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="self-end border border-white/10 bg-black/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur sm:p-5">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  bot status
                </div>
                <div className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                  {error ? "Telemetry offline" : "Operational"}
                </div>
              </div>
              <StatusPill tone={error ? "warn" : "ok"}>{error ? "Check DB" : "Live"}</StatusPill>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                  downloads
                </div>
                <div className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                  {formatNumber(stats?.totals.downloads)}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                  users
                </div>
                <div className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                  {formatNumber(stats?.totals.users)}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                  events
                </div>
                <div className="mt-2 text-xl font-semibold text-white sm:text-2xl">
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
            what it does
          </div>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold text-white sm:text-4xl">
            Download supported media without leaving Telegram.
          </h2>
          <p className="mt-4 max-w-xl text-zinc-400">
            Paste a link, keep chatting, and let MaxLoad send the file back to the same
            place. No extra app, no messy steps, just the bot and your Telegram chat.
          </p>
        </div>
        <div className="grid gap-px border border-white/10 bg-white/10 md:grid-cols-2">
          {platformCards.map((platform) => (
            <div key={platform.title} className="bg-black p-5">
              <h3 className="text-lg font-semibold text-white">{platform.title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-500">{platform.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.7fr_1fr] lg:px-8">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
            how it works
          </div>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold text-white sm:text-4xl">
            Use it right where you chat.
          </h2>
          <p className="mt-4 max-w-xl text-zinc-400">
            Open the bot, add it to a group, or use inline mode. MaxLoad keeps the download inside Telegram.
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
              live numbers
            </div>
            <h2 className="mt-2 text-3xl font-semibold text-white">Live stats</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            <ShieldCheck className="h-4 w-4" />
            Totals only, no private user history.
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
            <BarMetricChart
              data={(stats?.topActions ?? []).map((item) => ({
                ...item,
                label: formatActionLabel(item.label),
              }))}
            />
          </ChartCard>
        </section>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="border border-white/10 bg-black p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            FAQ
          </div>
          <div className="mt-4 divide-y divide-white/10 border-y border-white/10">
            {faqItems.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="cursor-pointer list-none pr-8 text-base font-semibold text-white marker:hidden">
                  {item.question}
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="border border-white/10 bg-black p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            Support
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-white">Need help?</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Message @mak5er or report a broken source on GitHub.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex items-center justify-center gap-2 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-[#229ED9]"
              href={supportUrl}
              target="_blank"
              rel="noreferrer"
            >
              Message @mak5er
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              className="inline-flex items-center justify-center gap-2 border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:border-white/40 hover:bg-white hover:text-black"
              href={githubIssuesUrl}
              target="_blank"
              rel="noreferrer"
            >
              Report on GitHub
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 border border-white/10 bg-black p-5 text-sm text-zinc-400 sm:flex-row sm:items-center">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              ready
            </div>
            <div className="mt-2 text-xl font-semibold text-white">
              Try a link in @{botHandle} and see the flow for yourself.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              className="inline-flex w-full items-center justify-center gap-2 bg-[#229ED9] px-4 py-2 font-semibold text-black hover:bg-white sm:w-auto"
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
    </>
  );
}
