import "server-only";

import { query, toNumber } from "@/lib/db";
import type { downloadsFilterSchema } from "@/lib/validators";
import type { z } from "zod";

export type DownloadFilters = z.infer<typeof downloadsFilterSchema>;

type DownloadRow = {
  id: string;
  url: string;
  file_id: string;
  file_type: string | null;
  date_added: Date;
};

type CountRow = {
  count: string;
};

type OptionRow = {
  value: string;
};

function buildDownloadsWhere(filters: DownloadFilters) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.search) {
    params.push(`%${filters.search}%`);
    clauses.push(`url ILIKE $${params.length}`);
  }

  if (filters.fileType) {
    params.push(filters.fileType);
    clauses.push(`file_type = $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    clauses.push(`date_added >= $${params.length}::timestamptz`);
  }

  if (filters.to) {
    params.push(filters.to);
    clauses.push(`date_added <= $${params.length}::timestamptz`);
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

export async function listDownloads(filters: DownloadFilters) {
  const { where, params } = buildDownloadsWhere(filters);
  const offset = (filters.page - 1) * filters.pageSize;
  const rowsParams = [...params, filters.pageSize, offset];

  const [rows, countRows] = await Promise.all([
    query<DownloadRow>(
      `
        SELECT id, url, file_id, file_type, date_added
        FROM downloaded_files
        ${where}
        ORDER BY date_added DESC, id DESC
        LIMIT $${params.length + 1}
        OFFSET $${params.length + 2}
      `,
      rowsParams,
    ),
    query<CountRow>(
      `SELECT COUNT(*) AS count FROM downloaded_files ${where}`,
      params,
    ),
  ]);

  return {
    rows: rows.map((row) => ({
      id: toNumber(row.id),
      url: row.url,
      fileId: row.file_id,
      fileType: row.file_type,
      dateAdded: row.date_added.toISOString(),
    })),
    total: toNumber(countRows[0]?.count),
  };
}

export async function getDownloadFilterOptions() {
  const rows = await query<OptionRow>(`
    SELECT DISTINCT file_type AS value
    FROM downloaded_files
    WHERE file_type IS NOT NULL AND file_type <> ''
    ORDER BY file_type ASC
    LIMIT 150
  `);

  return {
    fileTypes: rows.map((row) => row.value),
  };
}

