import { clsx } from "clsx";

type StatusPillProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "ok" | "warn" | "muted";
};

export function StatusPill({ children, className, tone = "ok" }: StatusPillProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em]",
        tone === "ok" && "border-white/15 bg-white text-black",
        tone === "warn" && "border-zinc-500 bg-zinc-950 text-zinc-200",
        tone === "muted" && "border-white/10 bg-black text-zinc-500",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
