import "server-only";

import { query, toNumber } from "@/lib/db";
import type { eventsFilterSchema } from "@/lib/validators";
import type { z } from "zod";

export type EventFilters = z.infer<typeof eventsFilterSchema>;

type EventRow = {
  id: string;
  user_id: string;
  user_name: string | null;
  user_username: string | null;
  chat_type: string | null;
  action_name: string;
  created_at: Date;
};

type CountRow = {
  count: string;
};

type OptionRow = {
  value: string;
};

function buildEventsWhere(filters: EventFilters) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.userId) {
    params.push(filters.userId);
    clauses.push(`e.user_id = $${params.length}`);
  }

  if (filters.actionName) {
    params.push(filters.actionName);
    clauses.push(`e.action_name = $${params.length}`);
  }

  if (filters.chatType) {
    params.push(filters.chatType);
    clauses.push(`e.chat_type = $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    clauses.push(`e.created_at >= $${params.length}::timestamptz`);
  }

  if (filters.to) {
    params.push(filters.to);
    clauses.push(`e.created_at <= $${params.length}::timestamptz`);
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

export async function listEvents(filters: EventFilters) {
  const { where, params } = buildEventsWhere(filters);
  const offset = (filters.page - 1) * filters.pageSize;
  const rowsParams = [...params, filters.pageSize, offset];

  const [rows, countRows] = await Promise.all([
    query<EventRow>(
      `
        SELECT
          e.id,
          e.user_id,
          u.user_name,
          u.user_username,
          e.chat_type,
          e.action_name,
          e.created_at
        FROM analytics_events e
        LEFT JOIN users u ON u.user_id = e.user_id
        ${where}
        ORDER BY e.created_at DESC, e.id DESC
        LIMIT $${params.length + 1}
        OFFSET $${params.length + 2}
      `,
      rowsParams,
    ),
    query<CountRow>(
      `SELECT COUNT(*) AS count FROM analytics_events e ${where}`,
      params,
    ),
  ]);

  return {
    rows: rows.map((row) => ({
      id: toNumber(row.id),
      userId: toNumber(row.user_id),
      userName: row.user_name,
      userUsername: row.user_username,
      chatType: row.chat_type,
      actionName: row.action_name,
      createdAt: row.created_at.toISOString(),
    })),
    total: toNumber(countRows[0]?.count),
  };
}

export async function getEventFilterOptions() {
  const [actions, chatTypes] = await Promise.all([
    query<OptionRow>(`
      SELECT DISTINCT action_name AS value
      FROM analytics_events
      WHERE action_name IS NOT NULL AND action_name <> ''
      ORDER BY action_name ASC
      LIMIT 200
    `),
    query<OptionRow>(`
      SELECT DISTINCT chat_type AS value
      FROM analytics_events
      WHERE chat_type IS NOT NULL AND chat_type <> ''
      ORDER BY chat_type ASC
      LIMIT 100
    `),
  ]);

  return {
    actionNames: actions.map((row) => row.value),
    chatTypes: chatTypes.map((row) => row.value),
  };
}
