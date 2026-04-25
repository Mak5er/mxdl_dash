export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-white/10 bg-black px-4 py-10 text-center text-sm text-zinc-500">
      {children}
    </div>
  );
}

