'use client';

import { Globe, Instagram, MessageCircle, Play, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { BusinessProfile } from '@/types';

type SocialLink = {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

function normalizeHandle(value: string | null | undefined) {
  return (value ?? '').trim().replace(/^@/, '');
}

function normalizePhone(value: string | null | undefined) {
  return (value ?? '').replace(/[^\d]/g, '');
}

function getSocialLinks(business: BusinessProfile): SocialLink[] {
  const instagram = normalizeHandle(business.instagram_handle);
  const tiktok = normalizeHandle(business.tiktok_handle);
  const whatsapp = normalizePhone(business.whatsapp_number);

  return [
    business.website_url ? { key: 'website', label: 'Website', href: business.website_url, icon: Globe } : null,
    instagram ? { key: 'instagram', label: 'Instagram', href: `https://instagram.com/${instagram}`, icon: Instagram } : null,
    tiktok ? { key: 'tiktok', label: 'TikTok', href: `https://www.tiktok.com/@${tiktok}`, icon: Video } : null,
    business.youtube_url ? { key: 'youtube', label: 'YouTube', href: business.youtube_url, icon: Play } : null,
    whatsapp ? { key: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/${whatsapp}`, icon: MessageCircle } : null
  ].filter(Boolean) as SocialLink[];
}

export function SocialIconLinks({
  business,
  variant = 'hero'
}: {
  business: BusinessProfile;
  variant?: 'hero' | 'contact';
}) {
  const links = getSocialLinks(business);
  if (!links.length) return null;

  return (
    <div className={variant === 'hero' ? 'mt-0 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end' : 'mt-3 flex flex-wrap gap-2'}>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.key}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${link.label}`}
            className={`inline-flex items-center gap-2 rounded-full border text-sm font-medium transition ${
              variant === 'hero'
                ? 'h-9 w-9 justify-center border-[var(--page-border)] bg-[var(--accent-soft)] text-[var(--accent-strong)] shadow-[0_10px_20px_rgba(62,35,8,0.06)] hover:border-[var(--page-border-strong)] hover:bg-[var(--page-surface)]'
                : 'border-[var(--border)] bg-[var(--page-card-bg)] text-[var(--text-2)] hover:border-[var(--accent)]'
            }`}
          >
            <Icon className="h-3 w-3" aria-hidden="true" />
            {variant === 'hero' ? <span className="sr-only">{link.label}</span> : <span>{link.label}</span>}
          </a>
        );
      })}
    </div>
  );
}
