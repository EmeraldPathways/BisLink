'use client';

import Image from 'next/image';

export function SectionImageHeader({
  title,
  subtitle,
  imageUrl,
  compact = false,
  attached = false,
  variant = 'default'
}: {
  title: string;
  subtitle: string;
  imageUrl?: string | null;
  compact?: boolean;
  attached?: boolean;
  variant?: 'default' | 'about';
}) {
  const isAbout = variant === 'about';

  return (
    <div
      className={`relative overflow-hidden ${attached ? 'rounded-none' : 'rounded-[28px]'} ${
        isAbout ? 'min-h-[388px]' : compact ? 'min-h-[210px]' : 'min-h-[250px]'
      }`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${title} section image`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 560px"
        />
      ) : null}
      <div
        className={`absolute inset-0 ${
          isAbout
            ? 'bg-[linear-gradient(90deg,rgba(7,6,5,0.84)_0%,rgba(7,6,5,0.54)_38%,rgba(7,6,5,0.08)_100%)]'
            : 'bg-[linear-gradient(90deg,rgba(12,11,9,0.82)_0%,rgba(12,11,9,0.58)_42%,rgba(12,11,9,0.16)_100%)]'
        }`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_34%)]" />
      <div
        className={`relative flex min-h-[inherit] flex-col justify-center text-white ${
          isAbout ? 'max-w-[250px] px-12 py-12' : 'max-w-[250px] px-6 py-8'
        }`}
      >
        <h2
          className={`font-display leading-[0.92] tracking-[-0.03em] text-white ${
            isAbout ? 'text-[74px]' : 'text-[48px]'
          }`}
        >
          {title}
        </h2>
        <p className={`text-white/82 ${isAbout ? 'mt-6 text-[27px] leading-[1.45]' : 'mt-4 text-[16px] leading-8'}`}>
          {subtitle}
        </p>
        <div className={`rounded-full bg-[var(--accent)] ${isAbout ? 'mt-7 h-[5px] w-[70px]' : 'mt-5 h-1 w-12'}`} />
      </div>
    </div>
  );
}
