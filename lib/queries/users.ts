import "server-only";

import { query, toNumber } from "@/lib/db";
import type { usersFilterSchema } from "@/lib/validators";
import type { z } from "zod";

export type UserFilters = z.infer<typeof usersFilterSchema>;

type UserRow = {
  user_id: string;
  user_name: string | null;
  user_username: string | null;
  chat_type: string | null;
  language: string | null;
  status: string | null;
  captions: string | null;
  delete_message: string | null;
  info_buttons: string | null;
  url_button: string | null;
  audio_button: string | null;
  event_count: string | null;
  last_activity: Date | null;
};

type CountRow = {
  count: string;
};

type OptionRow = {
  value: string;
};

const usersOrderColumns: Record<UserFilters["sort"], string> = {
  userId: "u.user_id",
  name: "LOWER(COALESCE(u.user_name, ''))",
  username: "LOWER(COALESCE(u.user_username, ''))",
  chatType: "LOWER(COALESCE(u.chat_type, ''))",
  language: "LOWER(COALESCE(u.language, ''))",
  status: "LOWER(COALESCE(u.status, ''))",
  settings:
    "LOWER(CONCAT_WS('|', s.captions, s.delete_message, s.info_buttons, s.url_button, s.audio_button))",
  events: "COALESCE(activity.event_count, 0)",
  lastActivity: "COALESCE(activity.last_activity, TIMESTAMP 'epoch')",
};

function buildUsersWhere(filters: UserFilters) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.search) {
    params.push(`%${filters.search}%`, filters.search);
    const textIndex = params.length - 1;
    const idIndex = params.length;
    clauses.push(
      `(u.user_name ILIKE $${textIndex} OR u.user_username ILIKE $${textIndex} OR u.user_id::text = $${idIndex})`,
    );
  }

  if (filters.chatType) {
    params.push(filters.chatType);
    clauses.push(`u.chat_type = $${params.length}`);
  }

  if (filters.language) {
    params.push(filters.language);
    clauses.push(`u.language = $${params.length}`);
  }

  if (filters.status) {
    params.push(filters.status);
    clauses.push(`u.status = $${params.length}`);
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

function buildUsersOrderBy(filters: UserFilters) {
  const column = usersOrderColumns[filters.sort];
  const direction = filters.direction === "asc" ? "ASC" : "DESC";

  return `ORDER BY ${column} ${direction}, u.user_id DESC`;
}

export async function listUsers(filters: UserFilters) {
  const { where, params } = buildUsersWhere(filters);
  const offset = (filters.page - 1) * filters.pageSize;
  const rowsParams = [...params, filters.pageSize, offset];
  const orderBy = buildUsersOrderBy(filters);

  const [rows, countRows] = await Promise.all([
    query<UserRow>(
      `
        SELECT
          u.user_id,
          u.user_name,
          u.user_username,
          u.chat_type,
          u.language,
          u.status,
          s.captions,
          s.delete_message,
          s.info_buttons,
          s.url_button,
          s.audio_button,
          activity.event_count,
          activity.last_activity
        FROM users u
        LEFT JOIN settings s ON s.user_id = u.user_id
        LEFT JOIN (
          SELECT user_id, COUNT(*) AS event_count, MAX(created_at) AS last_activity
          FROM analytics_events
          GROUP BY user_id
        ) activity ON activity.user_id = u.user_id
        ${where}
        ${orderBy}
        LIMIT $${params.length + 1}
        OFFSET $${params.length + 2}
      `,
      rowsParams,
    ),
    query<CountRow>(`SELECT COUNT(*) AS count FROM users u ${where}`, params),
  ]);

  return {
    rows: rows.map((row) => ({
      userId: toNumber(row.user_id),
      name: row.user_name,
      username: row.user_username,
      chatType: row.chat_type,
      language: row.language,
      status: row.status,
      settings: {
        captions: row.captions,
        deleteMessage: row.delete_message,
        infoButtons: row.info_buttons,
        urlButton: row.url_button,
        audioButton: row.audio_button,
      },
      eventCount: toNumber(row.event_count),
      lastActivity: row.last_activity?.toISOString() ?? null,
    })),
    total: toNumber(countRows[0]?.count),
  };
}

export async function getUserFilterOptions() {
  const [chatTypes, languages, statuses] = await Promise.all([
    query<OptionRow>(`
      SELECT DISTINCT chat_type AS value
      FROM users
      WHERE chat_type IS NOT NULL AND chat_type <> ''
      ORDER BY chat_type ASC
      LIMIT 100
    `),
    query<OptionRow>(`
      SELECT DISTINCT language AS value
      FROM users
      WHERE language IS NOT NULL AND language <> ''
      ORDER BY language ASC
      LIMIT 100
    `),
    query<OptionRow>(`
      SELECT DISTINCT status AS value
      FROM users
      WHERE status IS NOT NULL AND status <> ''
      ORDER BY status ASC
      LIMIT 100
    `),
  ]);

  return {
    chatTypes: chatTypes.map((row) => row.value),
    languages: languages.map((row) => row.value),
    statuses: statuses.map((row) => row.value),
  };
}

export async function getUserDetail(userId: number) {
  const [userRows, eventRows, seriesRows] = await Promise.all([
    query<UserRow>(
      `
        SELECT
          u.user_id,
          u.user_name,
          u.user_username,
          u.chat_type,
          u.language,
          u.status,
          s.captions,
          s.delete_message,
          s.info_buttons,
          s.url_button,
          s.audio_button,
          activity.event_count,
          activity.last_activity
        FROM users u
        LEFT JOIN settings s ON s.user_id = u.user_id
        LEFT JOIN (
          SELECT user_id, COUNT(*) AS event_count, MAX(created_at) AS last_activity
          FROM analytics_events
          WHERE user_id = $1
          GROUP BY user_id
        ) activity ON activity.user_id = u.user_id
        WHERE u.user_id = $1
      `,
      [userId],
    ),
    query<{
      id: string;
      action_name: string;
      chat_type: string | null;
      created_at: Date;
    }>(
      `
        SELECT id, action_name, chat_type, created_at
        FROM analytics_events
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 100
      `,
      [userId],
    ),
    query<{ bucket: Date; count: string }>(
      `
        SELECT date_trunc('day', created_at) AS bucket, COUNT(*) AS count
        FROM analytics_events
        WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY 1
        ORDER BY 1 ASC
      `,
      [userId],
    ),
  ]);

  const user = userRows[0];
  if (!user) {
    return null;
  }

  return {
    user: {
      userId: toNumber(user.user_id),
      name: user.user_name,
      username: user.user_username,
      chatType: user.chat_type,
      language: user.language,
      status: user.status,
      settings: {
        captions: user.captions,
        deleteMessage: user.delete_message,
        infoButtons: user.info_buttons,
        urlButton: user.url_button,
        audioButton: user.audio_button,
      },
      eventCount: toNumber(user.event_count),
      lastActivity: user.last_activity?.toISOString() ?? null,
    },
    events: eventRows.map((event) => ({
      id: toNumber(event.id),
      actionName: event.action_name,
      chatType: event.chat_type,
      createdAt: event.created_at.toISOString(),
    })),
    activity: seriesRows.map((row) => ({
      label: row.bucket.toISOString().slice(0, 10),
      count: toNumber(row.count),
    })),
  };
}
