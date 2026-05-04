'use client';

import type { PortfolioItemRecord } from '@/types';
import { ImageUploadField } from './ImageUploadField';

function createEmptyPortfolioItem(): PortfolioItemRecord {
  return {
    id: `temp-${crypto.randomUUID()}`,
    business_id: '',
    title: '',
    description: '',
    media_type: 'image',
    image_url: '',
    external_url: '',
    sort_order: 0,
    is_active: true,
    created_at: new Date().toISOString()
  };
}

export function PortfolioEditor({
  items,
  onChange
}: {
  items: PortfolioItemRecord[];
  onChange: (items: PortfolioItemRecord[]) => void;
}) {
  const activeCount = items.filter((item) => item.is_active).length;

  function patchItem(id: string, updates: Partial<PortfolioItemRecord>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...updates } : item)).map((item, index) => ({ ...item, sort_order: index })));
  }

  function moveItem(id: string, direction: -1 | 1) {
    const index = items.findIndex((item) => item.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return;

    const nextItems = [...items];
    const [entry] = nextItems.splice(index, 1);
    if (!entry) return;
    nextItems.splice(nextIndex, 0, entry);
    onChange(nextItems.map((item, itemIndex) => ({ ...item, sort_order: itemIndex })));
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="space-y-3 rounded-[22px] border border-[var(--color-border)] p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Portfolio item {index + 1}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => moveItem(item.id, -1)} className="rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs font-semibold">
                Up
              </button>
              <button type="button" onClick={() => moveItem(item.id, 1)} className="rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs font-semibold">
                Down
              </button>
              <button type="button" onClick={() => onChange(items.filter((entry) => entry.id !== item.id).map((entry, itemIndex) => ({ ...entry, sort_order: itemIndex })))} className="rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs font-semibold text-red-600">
                Delete
              </button>
            </div>
          </div>

          <ImageUploadField
            label="Portfolio image"
            value={item.image_url ?? ''}
            kind="portfolio"
            aspectHint="Square works best"
            onChange={(url) => patchItem(item.id, { image_url: url })}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">Title</label>
              <input value={item.title ?? ''} onChange={(event) => patchItem(item.id, { title: event.target.value })} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">Media type</label>
              <select value={item.media_type} onChange={(event) => patchItem(item.id, { media_type: event.target.value as PortfolioItemRecord['media_type'] })} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3">
                <option value="image">Image</option>
                <option value="video_link">Video Link</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">Description</label>
            <textarea value={item.description ?? ''} onChange={(event) => patchItem(item.id, { description: event.target.value })} className="min-h-[90px] w-full rounded-xl border border-[var(--color-border)] px-4 py-3" />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">External URL</label>
            <input value={item.external_url ?? ''} onChange={(event) => patchItem(item.id, { external_url: event.target.value })} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
            <input
              type="checkbox"
              checked={item.is_active}
              onChange={(event) => {
                if (event.target.checked && activeCount >= 6 && !item.is_active) return;
                patchItem(item.id, { is_active: event.target.checked });
              }}
            />
            Active on public page
          </label>
        </div>
      ))}

      <div className="flex items-center justify-between gap-3 rounded-[20px] border border-dashed border-[var(--color-border)] p-4">
        <p className="text-sm text-[var(--color-text-secondary)]">Add up to 6 active items. Inactive items stay in the editor only until you turn them on.</p>
        <button type="button" onClick={() => onChange([...items, { ...createEmptyPortfolioItem(), sort_order: items.length }])} className="rounded-xl bg-[var(--color-void)] px-4 py-2 text-sm font-semibold text-white">
          Add item
        </button>
      </div>
    </div>
  );
}
