import "server-only";

import { getEnvTtl, ttlCache } from "@/lib/cache";
import { query, toNumber } from "@/lib/db";

type CountRow = {
  downloads: string;
  users: string;
  events: string;
};

type SeriesRow = {
  bucket: Date;
  count: string;
};

type LabelCountRow = {
  label: string | null;
  count: string;
};

export type PublicStats = {
  totals: {
    downloads: number;
    users: number;
    events: number;
  };
  downloadsByDate: Array<{ label: string; count: number }>;
  downloadsByFileType: Array<{ label: string; count: number }>;
  topActions: Array<{ label: string; count: number }>;
  activityOverTime: Array<{ label: string; count: number }>;
  lastUpdated: string;
};

function dayLabel(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function loadPublicStats(): Promise<PublicStats> {
  const [totalsRows, downloadsByDateRows, fileTypeRows, topActionRows, eventRows] =
    await Promise.all([
      query<CountRow>(`
        SELECT
          (SELECT COUNT(*) FROM downloaded_files) AS downloads,
          (SELECT COUNT(*) FROM users) AS users,
          (SELECT COUNT(*) FROM analytics_events) AS events
      `),
      query<SeriesRow>(`
        SELECT date_trunc('day', date_added) AS bucket, COUNT(*) AS count
        FROM downloaded_files
        WHERE date_added >= NOW() - INTERVAL '30 days'
        GROUP BY 1
        ORDER BY 1 ASC
      `),
      query<LabelCountRow>(`
        SELECT COALESCE(NULLIF(file_type, ''), 'unknown') AS label, COUNT(*) AS count
        FROM downloaded_files
        GROUP BY 1
        ORDER BY COUNT(*) DESC
        LIMIT 10
      `),
      query<LabelCountRow>(`
        SELECT action_name AS label, COUNT(*) AS count
        FROM analytics_events
        GROUP BY action_name
        ORDER BY COUNT(*) DESC
        LIMIT 10
      `),
      query<SeriesRow>(`
        SELECT date_trunc('day', created_at) AS bucket, COUNT(*) AS count
        FROM analytics_events
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY 1
        ORDER BY 1 ASC
      `),
    ]);

  const totals = totalsRows[0] ?? { downloads: "0", users: "0", events: "0" };

  return {
    totals: {
      downloads: toNumber(totals.downloads),
      users: toNumber(totals.users),
      events: toNumber(totals.events),
    },
    downloadsByDate: downloadsByDateRows.map((row) => ({
      label: dayLabel(row.bucket),
      count: toNumber(row.count),
    })),
    downloadsByFileType: fileTypeRows.map((row) => ({
      label: row.label ?? "unknown",
      count: toNumber(row.count),
    })),
    topActions: topActionRows.map((row) => ({
      label: row.label ?? "unknown",
      count: toNumber(row.count),
    })),
    activityOverTime: eventRows.map((row) => ({
      label: dayLabel(row.bucket),
      count: toNumber(row.count),
    })),
    lastUpdated: new Date().toISOString(),
  };
}

export async function getPublicStats() {
  return ttlCache(
    "public-stats",
    getEnvTtl("PUBLIC_DASHBOARD_CACHE_TTL_SECONDS", 20),
    loadPublicStats,
  );
}
