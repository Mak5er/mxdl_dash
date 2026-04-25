type ChartCardProps = {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
};

export function ChartCard({ title, eyebrow, children }: ChartCardProps) {
  return (
    <section className="min-w-0 border border-white/10 bg-black p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          {eyebrow ? (
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              {eyebrow}
            </div>
          ) : null}
          <h2 className="mt-1 text-base font-semibold text-white">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}
