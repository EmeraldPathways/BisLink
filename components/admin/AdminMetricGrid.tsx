export function AdminMetricGrid({ metrics }: { metrics: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-[22px] border border-[var(--color-border)] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">{metric.label}</p>
          <p className="mt-3 text-lg font-semibold text-[var(--color-text-primary)]">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}
