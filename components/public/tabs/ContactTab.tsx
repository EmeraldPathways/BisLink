'use client';

import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { BusinessProfile } from '@/types';

export function ContactTab({ business }: { business: BusinessProfile }) {
  const rows = [
    { icon: Mail, label: 'Email', value: business.email ?? 'hello@example.com', href: `mailto:${business.email ?? 'hello@example.com'}` },
    { icon: Phone, label: 'Phone + WhatsApp', value: business.phone ?? business.whatsapp_number ?? '+1 555 000 0000', href: `tel:${business.phone ?? business.whatsapp_number ?? ''}` },
    { icon: MessageCircle, label: 'Instagram', value: business.instagram_handle ?? '@yourbusiness', href: `https://instagram.com/${(business.instagram_handle ?? '@yourbusiness').replace('@', '')}` }
  ];

  return (
    <section className="space-y-4 px-5 pb-10 pt-6">
      <div className="rounded-[18px] border-[1.5px] border-[var(--border)] bg-white p-5">
        {rows.map((row) => (
          <a key={row.label} href={row.href} className="flex items-center justify-between border-b border-[var(--border)] py-4 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--surface-2)] text-[var(--gold-dark)]">
                <row.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-1)]">{row.label}</p>
                <p className="text-sm text-[var(--text-3)]">{row.value}</p>
              </div>
            </div>
            <span className="text-[var(--text-3)]">→</span>
          </a>
        ))}
      </div>
      <div className="rounded-[18px] border-[1.5px] border-[var(--border)] bg-white p-5">
        <h3 className="font-display text-[19px] text-[var(--text-1)]">Send a message</h3>
        <div className="mt-4 space-y-3">
          <input className="w-full rounded-[13px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3" placeholder="Your Name" />
          <input className="w-full rounded-[13px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3" placeholder="Email" />
          <textarea className="min-h-[120px] w-full rounded-[13px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3" placeholder="Message" />
          <button className="w-full rounded-[15px] bg-[var(--void)] px-5 py-4 text-sm font-semibold text-white">Send Message</button>
        </div>
      </div>
      <div className="rounded-[18px] border-[1.5px] border-[var(--border)] bg-white p-5">
        <h3 className="font-display text-[19px] text-[var(--text-1)]">Location</h3>
        <div className="mt-4 flex h-[120px] items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#F7F4EF,#EEE9DF)] text-[var(--gold-dark)]">
          <MapPin className="mr-2 h-5 w-5" />
          Map preview
        </div>
        <p className="mt-4 text-sm font-semibold text-[var(--text-1)]">{business.address}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--text-3)]">{business.parking_notes}</p>
      </div>
    </section>
  );
}
