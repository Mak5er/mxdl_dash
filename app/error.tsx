"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-zinc-100">
      <div className="max-w-lg border border-white/10 bg-zinc-950 p-6">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          runtime fault
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-white">Dashboard error</h1>
        <p className="mt-3 text-sm text-zinc-500">{error.message}</p>
        <button
          className="mt-5 border border-white bg-white px-3 py-2 text-sm font-semibold text-black"
          onClick={() => reset()}
        >
          Retry
        </button>
      </div>
    </main>
  );
}

