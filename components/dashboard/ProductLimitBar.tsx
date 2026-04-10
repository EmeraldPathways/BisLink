export function ProductLimitBar({ count, limit = 10 }: { count: number; limit?: number }) {
  const percent = Math.min(100, (count / limit) * 100);

  return (
    <div className="rounded-[22px] border border-[var(--color-border)] bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">Product usage</p>
          <p className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
            {count} / {limit} products
          </p>
        </div>
        <span className="rounded-full bg-[var(--color-gold-muted)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-gold-dark)]">
          Max {limit}
        </span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-[var(--color-surface-3)]">
        <div className="h-2 rounded-full bg-[var(--color-void)]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
