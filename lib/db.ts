import "server-only";

import { Pool, type QueryResultRow } from "pg";

declare global {
  var downloaderDashboardPool:
    | {
        connectionString: string;
        pool: Pool;
      }
    | undefined;
}

export class DatabaseUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

function normalizeDatabaseUrl(connectionString: string) {
  const firstQuestion = connectionString.indexOf("?");
  const sslModeAsPathSuffix = /\/[^?\s"]+&sslmode=/i.test(connectionString);

  const url = firstQuestion === -1 && sslModeAsPathSuffix
    ? connectionString.replace("&sslmode=", "?sslmode=")
    : connectionString;

  try {
    const parsed = new URL(url);
    const sslMode = parsed.searchParams.get("sslmode");
    const legacySslModes = new Set(["prefer", "require", "verify-ca"]);

    if (sslMode && legacySslModes.has(sslMode) && !parsed.searchParams.has("uselibpqcompat")) {
      parsed.searchParams.set("uselibpqcompat", "true");
      return parsed.toString();
    }
  } catch {
    return url;
  }

  return url;
}

function getPositiveIntegerEnv(name: string, fallback: number) {
  const parsed = Number(process.env[name] ?? fallback);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function getSslConfig(connectionString: string) {
  try {
    const parsed = new URL(connectionString);
    const sslMode = parsed.searchParams.get("sslmode")?.toLowerCase();

    if (sslMode === "disable") {
      return undefined;
    }

    if (sslMode === "verify-ca" || sslMode === "verify-full") {
      return { rejectUnauthorized: true };
    }

    if (sslMode === "require" || sslMode === "prefer") {
      return { rejectUnauthorized: false };
    }
  } catch {
    return process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: true }
      : undefined;
  }

  return process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: true }
    : undefined;
}

function getPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new DatabaseUnavailableError("DATABASE_URL is not configured.");
  }

  const normalizedConnectionString = normalizeDatabaseUrl(connectionString);

  if (
    !globalThis.downloaderDashboardPool ||
    globalThis.downloaderDashboardPool.connectionString !== normalizedConnectionString
  ) {
    if (globalThis.downloaderDashboardPool) {
      void globalThis.downloaderDashboardPool.pool.end();
    }

    const pool = new Pool({
      connectionString: normalizedConnectionString,
      max: getPositiveIntegerEnv("DATABASE_POOL_MAX", 8),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      query_timeout: getPositiveIntegerEnv("DATABASE_QUERY_TIMEOUT_MS", 15_000),
      statement_timeout: getPositiveIntegerEnv("DATABASE_STATEMENT_TIMEOUT_MS", 15_000),
      idle_in_transaction_session_timeout: getPositiveIntegerEnv(
        "DATABASE_IDLE_TRANSACTION_TIMEOUT_MS",
        15_000,
      ),
      ssl: getSslConfig(normalizedConnectionString),
    });

    globalThis.downloaderDashboardPool = {
      connectionString: normalizedConnectionString,
      pool,
    };
  }

  return globalThis.downloaderDashboardPool.pool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params: readonly unknown[] = [],
) {
  try {
    const result = await getPool().query<T>(text, [...params]);
    return result.rows;
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      throw error;
    }

    console.error("Database query failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    throw new DatabaseUnavailableError("The database is unavailable.");
  }
}

export function toNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}
