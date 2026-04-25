import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { FilterBar } from "@/components/admin/FilterBar";
import { CopyButton } from "@/components/ui/CopyButton";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { hasAdminSession } from "@/lib/auth";
import { formatDateTime, formatNumber, nullLabel } from "@/lib/format";
import { getUserFilterOptions, listUsers, type UserFilters } from "@/lib/queries/users";
import { coerceSearchParams, usersFilterSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Users",
  description: "User records and settings for the MaxLoad bot.",
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function settingsSummary(settings: {
  captions: string | null;
  deleteMessage: string | null;
  infoButtons: string | null;
  urlButton: string | null;
  audioButton: string | null;
}) {
  return [
    ["captions", settings.captions],
    ["delete", settings.deleteMessage],
    ["info", settings.infoButtons],
    ["url", settings.urlButton],
    ["audio", settings.audioButton],
  ]
    .map(([label, value]) => `${label}:${value ?? "n/a"}`)
    .join(" / ");
}

const defaultSortDirections: Record<UserFilters["sort"], UserFilters["direction"]> = {
  userId: "desc",
  name: "asc",
  username: "asc",
  chatType: "asc",
  language: "asc",
  status: "asc",
  settings: "asc",
  events: "desc",
  lastActivity: "desc",
};

function usersSortHref(filters: UserFilters, sort: UserFilters["sort"]) {
  const direction =
    filters.sort === sort
      ? filters.direction === "desc"
        ? "asc"
        : "desc"
      : defaultSortDirections[sort];
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries({
    search: filters.search,
    chatType: filters.chatType,
    language: filters.language,
    status: filters.status,
    pageSize: filters.pageSize,
    sort,
    direction,
    page: 1,
  })) {
    if (value !== undefined && String(value) !== "") {
      params.set(key, String(value));
    }
  }

  return `/admin/users?${params.toString()}`;
}

function sortableColumn(
  filters: UserFilters,
  sort: UserFilters["sort"],
  label: string,
) {
  const active = filters.sort === sort;
  const indicator = active ? (filters.direction === "desc" ? "v" : "^") : "";

  return {
    key: sort,
    ariaSort: active
      ? filters.direction === "asc"
        ? "ascending"
        : "descending"
      : "none",
    header: (
      <Link
        className="inline-flex items-center gap-2 text-zinc-500 transition hover:text-white"
        href={usersSortHref(filters, sort)}
      >
        <span>{label}</span>
        {indicator ? <span className="text-white">{indicator}</span> : null}
      </Link>
    ),
  } as const;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const rawParams = coerceSearchParams((await searchParams) ?? {});
  const filters = usersFilterSchema.parse(rawParams);

  let data;
  let options: { chatTypes: string[]; languages: string[]; statuses: string[] } = {
    chatTypes: [],
    languages: [],
    statuses: [],
  };
  let error: string | null = null;

  try {
    [data, options] = await Promise.all([listUsers(filters), getUserFilterOptions()]);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Users are unavailable.";
    data = { rows: [], total: 0 };
  }

  return (
    <AdminShell>
      <div className="mb-6">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          records
        </div>
        <h1 className="mt-2 text-3xl font-semibold text-white">Users</h1>
      </div>

      <FilterBar
        searchValue={filters.search}
        searchPlaceholder="id / username / name"
        options={[
          {
            name: "chatType",
            label: "chat type",
            value: filters.chatType,
            items: options.chatTypes.map((value) => ({ label: value, value })),
          },
          {
            name: "language",
            label: "language",
            value: filters.language,
            items: options.languages.map((value) => ({ label: value, value })),
          },
          {
            name: "status",
            label: "status",
            value: filters.status,
            items: options.statuses.map((value) => ({ label: value, value })),
          },
        ]}
      >
        <input type="hidden" name="sort" value={filters.sort} />
        <input type="hidden" name="direction" value={filters.direction} />
        <input type="hidden" name="pageSize" value={filters.pageSize} />
      </FilterBar>

      {error ? (
        <div className="mt-4 border border-white/10 bg-black p-4 text-sm text-zinc-400">
          {error}
        </div>
      ) : null}

      <div className="mt-4">
        <DataTable
          columns={[
            sortableColumn(filters, "userId", "User ID"),
            sortableColumn(filters, "name", "Name"),
            sortableColumn(filters, "username", "Username"),
            sortableColumn(filters, "chatType", "Chat"),
            sortableColumn(filters, "language", "Language"),
            sortableColumn(filters, "status", "Status"),
            sortableColumn(filters, "settings", "Settings"),
            sortableColumn(filters, "events", "Events"),
            sortableColumn(filters, "lastActivity", "Last activity"),
          ]}
          rows={data.rows.map((user) => [
            <span className="inline-flex items-center gap-2" key="id">
              <Link className="font-mono text-white hover:underline" href={`/admin/users/${user.userId}`}>
                {user.userId}
              </Link>
              <CopyButton value={String(user.userId)} label="Copy user ID" />
            </span>,
            nullLabel(user.name),
            nullLabel(user.username ? `@${user.username}` : null),
            nullLabel(user.chatType),
            nullLabel(user.language),
            nullLabel(user.status),
            <span className="font-mono text-xs text-zinc-500" key="settings">
              {settingsSummary(user.settings)}
            </span>,
            formatNumber(user.eventCount),
            formatDateTime(user.lastActivity),
          ])}
        />
        <Pagination
          total={data.total}
          page={filters.page}
          pageSize={filters.pageSize}
          basePath="/admin/users"
          searchParams={{
            search: filters.search,
            chatType: filters.chatType,
            language: filters.language,
            status: filters.status,
            pageSize: filters.pageSize,
            sort: filters.sort,
            direction: filters.direction,
          }}
        />
      </div>
    </AdminShell>
  );
}
