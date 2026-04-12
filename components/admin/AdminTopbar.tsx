export function AdminTopbar({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold-dark)]">Internal admin</p>
        <h1 className="mt-2 font-display text-5xl tracking-[-0.6px]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">{description}</p>
      </div>
      <div className="rounded-[22px] bg-[var(--color-void)] px-6 py-5 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold)]">Visibility</p>
        <p className="mt-2 text-lg font-semibold">Admin-only workspace</p>
      </div>
    </div>
  );
}
