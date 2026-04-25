"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

type RefreshControlProps = {
  intervalSeconds: number;
};

export function RefreshControl({ intervalSeconds }: RefreshControlProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(intervalSeconds);
  const secondsUntilRefreshRef = useRef(intervalSeconds);

  const refresh = useCallback(() => {
    secondsUntilRefreshRef.current = intervalSeconds;
    startTransition(() => {
      router.refresh();
      setSecondsUntilRefresh(intervalSeconds);
    });
  }, [intervalSeconds, router]);

  useEffect(() => {
    if (intervalSeconds <= 0) {
      return;
    }

    const countdown = window.setInterval(() => {
      const nextSeconds = secondsUntilRefreshRef.current <= 1 ? intervalSeconds : secondsUntilRefreshRef.current - 1;

      secondsUntilRefreshRef.current = nextSeconds;
      setSecondsUntilRefresh(nextSeconds);

      if (nextSeconds === intervalSeconds && document.visibilityState === "visible") {
        refresh();
      }
    }, 1000);

    return () => window.clearInterval(countdown);
  }, [intervalSeconds, refresh]);

  const handleRefresh = useCallback(() => {
    if (document.visibilityState === "visible") {
      refresh();
    }
  }, [refresh]);

  return (
    <div className="flex items-center text-xs text-zinc-500">
      <button
        type="button"
        onClick={handleRefresh}
        className="inline-flex h-8 items-center gap-1.5 border border-white/10 bg-zinc-950/70 px-2.5 text-xs font-medium text-zinc-200 transition hover:border-white/30 hover:bg-white hover:text-black"
        title="Refresh data"
      >
        <RefreshCw className={clsx("h-3.5 w-3.5", isPending && "animate-spin")} />
        <span>Refresh</span>
      </button>
      <span className="hidden h-8 items-center border-y border-r border-white/10 bg-black/70 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500 sm:inline-flex">
        {intervalSeconds > 0 ? `${secondsUntilRefresh}s` : "off"}
      </span>
    </div>
  );
}
