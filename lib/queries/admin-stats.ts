import "server-only";

import { getEnvTtl, ttlCache } from "@/lib/cache";
import { query, toNumber } from "@/lib/db";

type CountRow = {
  total_users: string;
  total_downloads: string;
  total_events: string;
  downloads_today: string;
  downloads_7d: string;
  downloads_30d: string;
  events_today: string;
  events_7d: string;
  events_30d: string;
};

type LabelCountRow = {
  label: string | null;
  count: string;
};

type ActiveUserRow = {
  user_id: string;
  user_name: string | null;
  user_username: string | null;
  event_count: string;
  last_activity: Date | null;
};

type RecentActivityRow = {
  id: string;
  user_id: string;
  chat_type: string | null;
  action_name: string;
  created_at: Date;
};

type SeriesRow = {
  bucket: Date;
  count: string;
};

function dayLabel(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function loadAdminStats() {
  const [
    countsRows,
    activeUsersRows,
    topActionsRows,
    chatTypeRows,
    languageRows,
    fileTypeRows,
    recentActivityRows,
    eventSeriesRows,
  ] = await Promise.all([
    query<CountRow>(`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM downloaded_files) AS total_downloads,
        (SELECT COUNT(*) FROM analytics_events) AS total_events,
        (SELECT COUNT(*) FROM downloaded_files WHERE date_added >= date_trunc('day', NOW())) AS downloads_today,
        (SELECT COUNT(*) FROM downloaded_files WHERE date_added >= NOW() - INTERVAL '7 days') AS downloads_7d,
        (SELECT COUNT(*) FROM downloaded_files WHERE date_added >= NOW() - INTERVAL '30 days') AS downloads_30d,
        (SELECT COUNT(*) FROM analytics_events WHERE created_at >= date_trunc('day', NOW())) AS events_today,
        (SELECT COUNT(*) FROM analytics_events WHERE created_at >= NOW() - INTERVAL '7 days') AS events_7d,
        (SELECT COUNT(*) FROM analytics_events WHERE created_at >= NOW() - INTERVAL '30 days') AS events_30d
    `),
    query<ActiveUserRow>(`
      SELECT
        e.user_id,
        u.user_name,
        u.user_username,
        COUNT(*) AS event_count,
        MAX(e.created_at) AS last_activity
      FROM analytics_events e
      LEFT JOIN users u ON u.user_id = e.user_id
      GROUP BY e.user_id, u.user_name, u.user_username
      ORDER BY COUNT(*) DESC
      LIMIT 20
    `),
    query<LabelCountRow>(`
      SELECT action_name AS label, COUNT(*) AS count
      FROM analytics_events
      GROUP BY action_name
      ORDER BY COUNT(*) DESC
      LIMIT 12
    `),
    query<LabelCountRow>(`
      SELECT COALESCE(NULLIF(chat_type, ''), 'unknown') AS label, COUNT(*) AS count
      FROM users
      GROUP BY 1
      ORDER BY COUNT(*) DESC
      LIMIT 12
    `),
    query<LabelCountRow>(`
      SELECT COALESCE(NULLIF(language, ''), 'unknown') AS label, COUNT(*) AS count
      FROM users
      GROUP BY 1
      ORDER BY COUNT(*) DESC
      LIMIT 12
    `),
    query<LabelCountRow>(`
      SELECT COALESCE(NULLIF(file_type, ''), 'unknown') AS label, COUNT(*) AS count
      FROM downloaded_files
      GROUP BY 1
      ORDER BY COUNT(*) DESC
      LIMIT 12
    `),
    query<RecentActivityRow>(`
      SELECT id, user_id, chat_type, action_name, created_at
      FROM analytics_events
      ORDER BY created_at DESC
      LIMIT 20
    `),
    query<SeriesRow>(`
      SELECT date_trunc('day', created_at) AS bucket, COUNT(*) AS count
      FROM analytics_events
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY 1
      ORDER BY 1 ASC
    `),
  ]);

  const counts = countsRows[0] ?? {
    total_users: "0",
    total_downloads: "0",
    total_events: "0",
    downloads_today: "0",
    downloads_7d: "0",
    downloads_30d: "0",
    events_today: "0",
    events_7d: "0",
    events_30d: "0",
  };

  return {
    counts: {
      totalUsers: toNumber(counts.total_users),
      totalDownloads: toNumber(counts.total_downloads),
      totalEvents: toNumber(counts.total_events),
      newUsersToday: null,
      newUsers7d: null,
      newUsers30d: null,
      downloadsToday: toNumber(counts.downloads_today),
      downloads7d: toNumber(counts.downloads_7d),
      downloads30d: toNumber(counts.downloads_30d),
      eventsToday: toNumber(counts.events_today),
      events7d: toNumber(counts.events_7d),
      events30d: toNumber(counts.events_30d),
    },
    activeUsers: activeUsersRows.map((row) => ({
      userId: toNumber(row.user_id),
      name: row.user_name,
      username: row.user_username,
      eventCount: toNumber(row.event_count),
      lastActivity: row.last_activity?.toISOString() ?? null,
    })),
    topActions: topActionsRows.map((row) => ({
      label: row.label ?? "unknown",
      count: toNumber(row.count),
    })),
    chatTypes: chatTypeRows.map((row) => ({
      label: row.label ?? "unknown",
      count: toNumber(row.count),
    })),
    languages: languageRows.map((row) => ({
      label: row.label ?? "unknown",
      count: toNumber(row.count),
    })),
    fileTypes: fileTypeRows.map((row) => ({
      label: row.label ?? "unknown",
      count: toNumber(row.count),
    })),
    recentActivity: recentActivityRows.map((row) => ({
      id: toNumber(row.id),
      userId: toNumber(row.user_id),
      chatType: row.chat_type,
      actionName: row.action_name,
      createdAt: row.created_at.toISOString(),
    })),
    eventsOverTime: eventSeriesRows.map((row) => ({
      label: dayLabel(row.bucket),
      count: toNumber(row.count),
    })),
    lastUpdated: new Date().toISOString(),
  };
}

export async function getAdminStats() {
  return ttlCache(
    "admin-stats",
    getEnvTtl("ADMIN_DASHBOARD_CACHE_TTL_SECONDS", 5),
    loadAdminStats,
  );
}
