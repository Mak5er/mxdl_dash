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

export function DataTable({
  columns,
  rows,
  emptyMessage = "No rows found.",
}: DataTableProps) {
  return (
    <div className="min-w-0 overflow-hidden border border-white/10 bg-black">
      <div className="overflow-x-auto">
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
