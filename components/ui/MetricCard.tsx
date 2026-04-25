import { clsx } from "clsx";

type MetricCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  tone?: "default" | "muted";
};

export function MetricCard({
  label,
  value,
  detail,
  tone = "default",
}: MetricCardProps) {
  return (
    <div
      className={clsx(
        "border border-white/10 bg-black p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        tone === "muted" && "bg-zinc-950",
      )}
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
      {detail ? <div className="mt-2 text-sm text-zinc-500">{detail}</div> : null}
    </div>
  );
}

