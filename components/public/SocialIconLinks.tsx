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
    <div className={`flex flex-wrap gap-2 ${variant === 'hero' ? 'mt-4' : 'mt-3'}`}>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.key}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${link.label}`}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
              variant === 'hero'
                ? 'border-white/20 bg-white/10 text-[var(--hero-text)] hover:bg-white/16'
                : 'border-[var(--border)] bg-[var(--page-card-bg)] text-[var(--text-2)] hover:border-[var(--accent)]'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{link.label}</span>
          </a>
        );
      })}
    </div>
  );
}
