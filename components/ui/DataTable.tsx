type DataTableColumn = {
  key: string;
  header: React.ReactNode;
  className?: string;
  ariaSort?: "ascending" | "descending" | "none";
};

type DataTableProps = {
  columns: Array<string | DataTableColumn>;
  rows: React.ReactNode[][];
  emptyMessage?: string;
};

function columnKey(column: string | DataTableColumn, index: number) {
  return typeof column === "string" ? column : column.key || String(index);
}

function columnHeader(column: string | DataTableColumn) {
  return typeof column === "string" ? column : column.header;
}

function mobileLabel(column: string | DataTableColumn) {
  if (typeof column === "string") {
    return column;
  }

  return column.key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function DataTable({
  columns,
  rows,
  emptyMessage = "No rows found.",
}: DataTableProps) {
  return (
    <div className="min-w-0 overflow-hidden border border-white/10 bg-black">
      <div className="md:hidden">
        {rows.length ? (
          <div className="divide-y divide-white/10">
            {rows.map((row, rowIndex) => (
              <article key={rowIndex} className="space-y-3 p-3">
                <div className="min-w-0">
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                    {mobileLabel(columns[0])}
                  </div>
                  <div className="mt-1.5 min-w-0 break-words text-base font-semibold text-white">
                    {row[0]}
                  </div>
                </div>
                <dl className="grid gap-2">
                  {row.slice(1).map((cell, cellIndex) => (
                    <div
                      key={`${rowIndex}-${cellIndex}`}
                      className="grid min-w-0 grid-cols-[5.75rem_minmax(0,1fr)] items-start gap-2"
                    >
                      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                        {mobileLabel(columns[cellIndex + 1])}
                      </dt>
                      <dd className="min-w-0 break-words text-sm leading-5 text-zinc-300">
                        {cell}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-zinc-500">{emptyMessage}</div>
        )}
      </div>

      <div className="hidden overflow-x-auto [-webkit-overflow-scrolling:touch] md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-white/10 bg-zinc-950 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={columnKey(column, index)}
                  aria-sort={typeof column === "string" ? undefined : column.ariaSort}
                  className={`px-4 py-3 font-medium ${
                    typeof column === "string" ? "" : column.className ?? ""
                  }`}
                >
                  {columnHeader(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.length ? (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="align-top text-zinc-300">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-zinc-500" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
