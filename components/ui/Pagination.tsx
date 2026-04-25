import Link from "next/link";

type PaginationProps = {
  total: number;
  page: number;
  pageSize: number;
  basePath: string;
  searchParams: Record<string, string | number | undefined>;
};

function hrefFor(
  basePath: string,
  searchParams: Record<string, string | number | undefined>,
  page: number,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries({ ...searchParams, page })) {
    if (value !== undefined && String(value) !== "") {
      params.set(key, String(value));
    }
  }

  return `${basePath}?${params.toString()}`;
}

export function Pagination({
  total,
  page,
  pageSize,
  basePath,
  searchParams,
}: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const previousDisabled = page <= 1;
  const nextDisabled = page >= pages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-x border-b border-white/10 bg-zinc-950 px-4 py-3 text-sm text-zinc-500">
      <span>
        Page {page} of {pages} / {total} rows
      </span>
      <div className="flex gap-2">
        {previousDisabled ? (
          <span className="border border-white/10 px-3 py-1 text-zinc-700">Previous</span>
        ) : (
          <Link
            className="border border-white/15 px-3 py-1 text-zinc-200 hover:bg-white hover:text-black"
            href={hrefFor(basePath, searchParams, page - 1)}
          >
            Previous
          </Link>
        )}
        {nextDisabled ? (
          <span className="border border-white/10 px-3 py-1 text-zinc-700">Next</span>
        ) : (
          <Link
            className="border border-white/15 px-3 py-1 text-zinc-200 hover:bg-white hover:text-black"
            href={hrefFor(basePath, searchParams, page + 1)}
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
