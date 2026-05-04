import Image from 'next/image';
import { ArrowUpRight, PlayCircle } from 'lucide-react';
import type { PortfolioItemRecord } from '@/types';

export function PortfolioSection({
  id = 'portfolio',
  items
}: {
  id?: string;
  items: PortfolioItemRecord[];
}) {
  if (!items.length) return null;

  return (
    <section id={id} className="scroll-mt-20 px-2 pb-8">
      <div className="px-3 pb-4">
        <h2 className="font-display text-3xl text-[var(--text-1)]">Portfolio</h2>
        <p className="mt-1 text-sm text-[var(--text-3)]">Recent work, results, and client moments.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const content = (
            <article className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--page-card-bg)] shadow-[var(--card-shadow)]">
              <div className="relative aspect-square bg-[image:var(--media-gradient)]">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.title?.trim() || 'Portfolio image'} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--accent-strong)]">
                    <PlayCircle className="h-10 w-10" aria-hidden="true" />
                  </div>
                )}
                {item.media_type === 'video_link' ? (
                  <span className="absolute right-2 top-2 rounded-full bg-black/65 px-2 py-1 text-[11px] font-semibold text-white">
                    Watch →
                  </span>
                ) : null}
              </div>
              <div className="space-y-1 p-3">
                {item.title ? <h3 className="text-sm font-semibold text-[var(--text-1)]">{item.title}</h3> : null}
                {item.description ? <p className="text-xs leading-5 text-[var(--text-3)]">{item.description}</p> : null}
                {item.external_url ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-strong)]">
                    {item.media_type === 'video_link' ? 'Watch' : 'Open'}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                ) : null}
              </div>
            </article>
          );

          if (!item.external_url) {
            return <div key={item.id}>{content}</div>;
          }

          return (
            <a key={item.id} href={item.external_url} target="_blank" rel="noreferrer" className="block">
              {content}
            </a>
          );
        })}
      </div>
    </section>
  );
}
