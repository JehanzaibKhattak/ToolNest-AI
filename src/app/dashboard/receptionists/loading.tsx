export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite" className="grid gap-4">
      <span className="sr-only">Loading receptionists…</span>
      <div className="h-8 w-64 animate-pulse rounded-lg bg-[color:var(--border)]" />
      <div className="grid-auto">
        {[0, 1, 2].map((i) => (
          <div className="card h-36 animate-pulse" key={i} />
        ))}
      </div>
    </div>
  );
}
