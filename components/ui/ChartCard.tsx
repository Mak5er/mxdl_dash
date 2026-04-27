import { Reveal } from "@/components/ui/Motion";

type ChartCardProps = {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
};

export function ChartCard({ title, eyebrow, children }: ChartCardProps) {
  return (
    <Reveal>
      <section className="min-w-0 overflow-hidden border border-white/10 bg-black p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <div>
          {eyebrow ? (
            <div className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">
              {eyebrow}
            </div>
          ) : null}
          <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>
        </div>
      </div>
      {children}
      </section>
    </Reveal>
  );
}
