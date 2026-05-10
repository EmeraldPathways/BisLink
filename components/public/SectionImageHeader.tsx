'use client';

import Image from 'next/image';

export function SectionImageHeader({
  title,
  subtitle,
  imageUrl,
  compact = false,
  attached = false
}: {
  title: string;
  subtitle: string;
  imageUrl?: string | null;
  compact?: boolean;
  attached?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden ${attached ? 'rounded-none' : 'rounded-[28px]'} ${compact ? 'min-h-[210px]' : 'min-h-[250px]'}`}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${title} section image`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 560px"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,11,9,0.82)_0%,rgba(12,11,9,0.58)_42%,rgba(12,11,9,0.16)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_34%)]" />
      <div className="relative flex min-h-[inherit] max-w-[250px] flex-col justify-center px-6 py-8 text-white">
        <h2 className="font-display text-[48px] leading-[0.92] tracking-[-0.03em] text-white">
          {title}
        </h2>
        <p className="mt-4 text-[16px] leading-8 text-white/82">{subtitle}</p>
        <div className="mt-5 h-1 w-12 rounded-full bg-[var(--accent)]" />
      </div>
    </div>
  );
}
