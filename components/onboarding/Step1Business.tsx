import { businessCategories } from '@/lib/demo-data';

export function Step1Business() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-dark)]">Step 1 of 5</p>
        <h2 className="mt-2 font-display text-5xl">Your business</h2>
      </div>
      <input className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-4" defaultValue="Studio Eleven" placeholder="Business name" />
      <select className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-4" defaultValue="Personal Training">
        {businessCategories.map((category) => (
          <option key={category}>{category}</option>
        ))}
      </select>
      <textarea className="min-h-[140px] w-full rounded-2xl border border-[var(--color-border)] px-4 py-4" defaultValue="Movement coaching for real people." />
      <input className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-4" defaultValue="Brooklyn, NY" placeholder="Location" />
      <input className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-4" defaultValue="studio-eleven" placeholder="Slug" />
    </div>
  );
}
