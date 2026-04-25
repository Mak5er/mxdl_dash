import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { CopyButton } from "@/components/ui/CopyButton";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { hasAdminSession } from "@/lib/auth";
import { formatDateTime, nullLabel, truncateMiddle } from "@/lib/format";
import { getDownloadFilterOptions, listDownloads } from "@/lib/queries/downloads";
import { coerceSearchParams, downloadsFilterSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Downloads",
  description: "Downloaded file records for the MaxLoad bot.",
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminDownloadsPage({ searchParams }: PageProps) {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const rawParams = coerceSearchParams((await searchParams) ?? {});
  const filters = downloadsFilterSchema.parse(rawParams);

  let data;
  let options: { fileTypes: string[] } = { fileTypes: [] };
  let error: string | null = null;

  try {
    [data, options] = await Promise.all([
      listDownloads(filters),
      getDownloadFilterOptions(),
    ]);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Downloads are unavailable.";
    data = { rows: [], total: 0 };
  }

  return (
    <AdminShell>
      <div className="mb-6">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          records
        </div>
        <h1 className="mt-2 text-3xl font-semibold text-white">Downloaded files</h1>
      </div>

      <form className="grid gap-3 border border-white/10 bg-zinc-950 p-4 md:grid-cols-5">
        <input
          name="search"
          defaultValue={filters.search}
          placeholder="search URL"
          className="border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-white/40"
        />
        <select
          name="fileType"
          defaultValue={filters.fileType ?? ""}
          className="border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
        >
          <option value="">file type</option>
          {options.fileTypes.map((value) => (
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
          columns={["ID", "URL", "File ID", "Type", "Added"]}
          rows={data.rows.map((download) => [
            <span className="font-mono text-white" key="id">{download.id}</span>,
            <span className="inline-flex max-w-[34rem] items-center gap-2" key="url">
              <span className="truncate font-mono text-xs" title={download.url}>
                {truncateMiddle(download.url)}
              </span>
              <CopyButton value={download.url} label="Copy URL" />
            </span>,
            <span className="inline-flex items-center gap-2 font-mono text-xs" key="file">
              {truncateMiddle(download.fileId, 28)}
              <CopyButton value={download.fileId} label="Copy file ID" />
            </span>,
            nullLabel(download.fileType),
            formatDateTime(download.dateAdded),
          ])}
        />
        <Pagination
          total={data.total}
          page={filters.page}
          pageSize={filters.pageSize}
          basePath="/admin/downloads"
          searchParams={{
            search: filters.search,
            fileType: filters.fileType,
            from: filters.from,
            to: filters.to,
            pageSize: filters.pageSize,
          }}
        />
      </div>
    </AdminShell>
  );
}
