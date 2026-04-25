import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { hasAdminSession } from "@/lib/auth";
import { formatDateTime, nullLabel } from "@/lib/format";
import { getEventFilterOptions, listEvents } from "@/lib/queries/events";
import { coerceSearchParams, eventsFilterSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description: "Analytics event records for the MaxLoad bot.",
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminEventsPage({ searchParams }: PageProps) {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const rawParams = coerceSearchParams((await searchParams) ?? {});
  const filters = eventsFilterSchema.parse(rawParams);

  let data;
  let options: { actionNames: string[]; chatTypes: string[] } = {
    actionNames: [],
    chatTypes: [],
  };
  let error: string | null = null;

  try {
    [data, options] = await Promise.all([listEvents(filters), getEventFilterOptions()]);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Events are unavailable.";
    data = { rows: [], total: 0 };
  }

  return (
    <AdminShell>
      <div className="mb-6">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          records
        </div>
        <h1 className="mt-2 text-3xl font-semibold text-white">Analytics events</h1>
      </div>

      <form className="grid gap-3 border border-white/10 bg-zinc-950 p-4 md:grid-cols-6">
        <input
          name="userId"
          defaultValue={filters.userId}
          placeholder="user id"
          className="border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-white/40"
        />
        <select
          name="actionName"
          defaultValue={filters.actionName ?? ""}
          className="border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
        >
          <option value="">action</option>
          {options.actionNames.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          name="chatType"
          defaultValue={filters.chatType ?? ""}
          className="border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
        >
          <option value="">chat type</option>
          {options.chatTypes.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <input
          name="from"
          defaultValue={filters.from}
          type="date"
          className="border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
        />
        <input
          name="to"
          defaultValue={filters.to}
          type="date"
          className="border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
        />
        <button className="border border-white bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-zinc-200">
          Apply
        </button>
      </form>

      {error ? (
        <div className="mt-4 border border-white/10 bg-black p-4 text-sm text-zinc-400">
          {error}
        </div>
      ) : null}

      <div className="mt-4">
        <DataTable
          columns={["ID", "User", "Chat", "Action", "Created"]}
          rows={data.rows.map((event) => [
            <span className="font-mono text-white" key="id">{event.id}</span>,
            <Link className="font-mono text-white hover:underline" href={`/admin/users/${event.userId}`} key="user">
              {event.userId}
            </Link>,
            nullLabel(event.chatType),
            <span className="font-mono text-xs" key="action">{event.actionName}</span>,
            formatDateTime(event.createdAt),
          ])}
        />
        <Pagination
          total={data.total}
          page={filters.page}
          pageSize={filters.pageSize}
          basePath="/admin/events"
          searchParams={{
            userId: filters.userId,
            actionName: filters.actionName,
            chatType: filters.chatType,
            from: filters.from,
            to: filters.to,
            pageSize: filters.pageSize,
          }}
        />
      </div>
    </AdminShell>
  );
}
