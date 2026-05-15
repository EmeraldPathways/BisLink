'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight, Globe, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { SectionImageHeader } from '@/components/public/SectionImageHeader';
import type { BusinessProfile, PublicContactSubmission } from '@/types';

type FormErrors = Partial<Record<'senderName' | 'senderEmail' | 'message', string>>;

function normalizePhone(value: string | null | undefined) {
  return (value ?? '').replace(/[^\d]/g, '');
}

function formatContactValue(label: string, value: string) {
  if (label === 'Website') {
    return value.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  return value;
}

export function ContactTab({ id = 'contact', business }: { id?: string; business: BusinessProfile }) {
  const [form, setForm] = useState({ senderName: '', senderEmail: '', message: '', website: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const rows = useMemo(
    () =>
      [
        business.email ? { icon: Mail, label: 'Email', value: business.email, href: `mailto:${business.email}` } : null,
        business.phone ? { icon: Phone, label: 'Phone', value: business.phone, href: `tel:${business.phone}` } : null,
        business.whatsapp_number
          ? {
              icon: MessageCircle,
              label: 'WhatsApp',
              value: business.whatsapp_number,
              href: `https://wa.me/${normalizePhone(business.whatsapp_number)}`
            }
          : null,
        business.website_url ? { icon: Globe, label: 'Website', value: business.website_url, href: business.website_url } : null
      ].filter(Boolean) as Array<{ icon: typeof Mail; label: string; value: string; href: string }>,
    [business.email, business.phone, business.website_url, business.whatsapp_number]
  );

  const locationText = business.address ?? business.location ?? null;
  const hasLocation = Boolean(locationText || business.google_maps_url);
  const mapHref =
    business.google_maps_url ??
    (locationText ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}` : null);

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (form.senderName.trim().length < 2) nextErrors.senderName = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.senderEmail.trim())) nextErrors.senderEmail = 'Enter a valid email address.';
    if (form.message.trim().length < 10) nextErrors.message = 'Message must be at least 10 characters.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const payload: PublicContactSubmission = {
        businessId: business.id,
        senderName: form.senderName.trim(),
        senderEmail: form.senderEmail.trim(),
        message: form.message.trim(),
        honeypot: form.website.trim()
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok) {
        throw new Error(result.error || 'Could not send your message');
      }

      setForm({ senderName: '', senderEmail: '', message: '', website: '' });
      setErrors({});
      setMessage('Message sent successfully.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not send your message');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id={id} className="scroll-mt-20 px-2 pb-10 pt-3">
      <div className="overflow-hidden rounded-[32px] border border-[var(--page-border)] bg-[var(--page-card-bg)] shadow-[var(--card-shadow)]">
        <SectionImageHeader
          title={business.contact_title?.trim() || 'Contact'}
          subtitle={business.contact_subtitle?.trim() || 'Reach out, send a message, or find the quickest way to connect.'}
          imageUrl={business.contact_image_url ?? business.cover_image_url}
          compact
          attached
        />

        <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
          <div className="px-1 py-1 sm:px-2">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="hidden">
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="contact-name" className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-strong)]">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    value={form.senderName}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, senderName: event.target.value }));
                      setErrors((current) => ({ ...current, senderName: undefined }));
                    }}
                    className="w-full rounded-[16px] border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm"
                    required
                    minLength={2}
                  />
                  {errors.senderName ? <p className="text-xs text-red-600">{errors.senderName}</p> : null}
                </div>

                <div className="space-y-1">
                  <label htmlFor="contact-email" className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-strong)]">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    value={form.senderEmail}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, senderEmail: event.target.value }));
                      setErrors((current) => ({ ...current, senderEmail: undefined }));
                    }}
                    className="w-full rounded-[16px] border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm"
                    type="email"
                    required
                  />
                  {errors.senderEmail ? <p className="text-xs text-red-600">{errors.senderEmail}</p> : null}
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-message" className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-strong)]">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, message: event.target.value }));
                    setErrors((current) => ({ ...current, message: undefined }));
                  }}
                  className="min-h-[88px] w-full rounded-[16px] border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm"
                  required
                  minLength={10}
                />
                {errors.message ? <p className="text-xs text-red-600">{errors.message}</p> : null}
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="min-h-[20px]">
                  {message ? <p className="text-xs text-green-700">{message}</p> : null}
                  {error ? <p className="text-xs text-red-600">{error}</p> : null}
                </div>
                <button
                  disabled={loading}
                  className="inline-flex shrink-0 items-center gap-2 rounded-[16px] bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(139,104,37,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>

          {rows.length ? (
            <div className="space-y-3 px-1 py-1 sm:px-2">
              {rows.map((row) => (
                <a
                  key={row.label}
                  href={row.href}
                  target={row.href.startsWith('http') ? '_blank' : undefined}
                  rel={row.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="flex items-start gap-4 py-1"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),var(--page-surface-muted))] text-[var(--accent-strong)]">
                    <row.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">{row.label}</p>
                    <p className="mt-1.5 break-words text-[14px] font-normal leading-5 text-[var(--text-1)] sm:text-[15px] sm:leading-6">
                      {formatContactValue(row.label, row.value)}
                    </p>
                  </div>
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[var(--page-surface-muted)] text-[var(--accent-strong)]">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </a>
              ))}
            </div>
          ) : null}

          {hasLocation ? (
            <div className="border-t border-[var(--page-border)] px-1 pt-5 sm:px-2">
              <a
                href={mapHref ?? '#'}
                target="_blank"
                rel="noreferrer"
                className={`block overflow-hidden rounded-[24px] border border-[var(--page-border)] bg-[#ebefe6] ${mapHref ? '' : 'pointer-events-none'}`}
              >
                <div className="relative aspect-[16/6] overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.85),transparent_26%),linear-gradient(180deg,#f5f2ec_0%,#e5ece1_100%)]" />
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 360 220"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full"
                  >
                    <g fill="rgba(132,158,128,0.22)">
                      <path d="M12 22h74a10 10 0 0 1 10 10v44a10 10 0 0 1-10 10H18a10 10 0 0 1-10-10V30a8 8 0 0 1 4-8z" />
                      <path d="M278 18h60a10 10 0 0 1 10 10v56a10 10 0 0 1-10 10h-52a10 10 0 0 1-10-10V28a10 10 0 0 1 2-10z" />
                      <path d="M232 150h92a10 10 0 0 1 10 10v42a10 10 0 0 1-10 10h-98a10 10 0 0 1-10-10v-32a20 20 0 0 1 16-20z" />
                    </g>
                    <g fill="rgba(131,165,190,0.18)">
                      <path d="M120 22h122a12 12 0 0 1 12 12v34a12 12 0 0 1-12 12H128a12 12 0 0 1-12-12V34a12 12 0 0 1 4-12z" />
                    </g>
                    <g fill="rgba(99,110,124,0.12)">
                      <rect x="34" y="106" width="42" height="26" rx="6" />
                      <rect x="84" y="104" width="34" height="30" rx="6" />
                      <rect x="126" y="102" width="38" height="34" rx="6" />
                      <rect x="176" y="100" width="28" height="38" rx="6" />
                      <rect x="216" y="104" width="30" height="30" rx="6" />
                      <rect x="258" y="104" width="42" height="28" rx="6" />
                      <rect x="52" y="150" width="34" height="22" rx="5" />
                      <rect x="94" y="146" width="28" height="30" rx="5" />
                      <rect x="132" y="148" width="54" height="24" rx="5" />
                      <rect x="40" y="182" width="52" height="18" rx="5" />
                      <rect x="104" y="182" width="34" height="18" rx="5" />
                      <rect x="150" y="180" width="30" height="20" rx="5" />
                    </g>
                    <g fill="none" stroke="rgba(255,255,255,0.88)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M-12 92 H374" />
                      <path d="M20 142 H330" />
                      <path d="M106 -10 V236" />
                      <path d="M206 -10 V236" />
                    </g>
                    <g fill="none" stroke="rgba(255,255,255,0.72)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M-12 50 H124" />
                      <path d="M152 50 H372" />
                      <path d="M18 188 H228" />
                      <path d="M38 18 V92" />
                      <path d="M38 142 V218" />
                      <path d="M156 78 V220" />
                      <path d="M258 18 V142" />
                      <path d="M316 92 V220" />
                      <path d="M236 148 C258 142, 276 128, 292 104" />
                    </g>
                    <g fill="none" stroke="rgba(199,167,96,0.52)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M-16 116 C44 102, 94 118, 146 110 S258 92, 378 110" />
                      <path d="M182 -10 C174 42, 192 82, 190 126 S178 200, 184 236" />
                    </g>
                    <g fill="none" stroke="rgba(255,255,255,0.64)" strokeWidth="2.5" strokeDasharray="7 8" strokeLinecap="round">
                      <path d="M-8 92 H372" />
                      <path d="M20 142 H330" />
                      <path d="M106 -10 V236" />
                      <path d="M206 -10 V236" />
                    </g>
                    <g transform="translate(212 106)">
                      <circle r="34" fill="rgba(201,164,92,0.18)" />
                      <circle r="20" fill="rgba(201,164,92,0.22)" />
                      <path
                        d="M0-18c-9.39 0-17 7.61-17 17 0 12.75 17 31 17 31s17-18.25 17-31c0-9.39-7.61-17-17-17z"
                        fill="rgba(166,107,32,0.96)"
                      />
                      <circle cy="-1" r="6" fill="white" />
                    </g>
                  </svg>
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0)_30%,rgba(17,24,39,0.03)_100%)]" />
                  <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-full border border-white/80 bg-white/95 px-6 py-3 text-sm font-semibold text-[color:color-mix(in_srgb,var(--accent-strong)_88%,#1f2937)] shadow-[0_14px_34px_rgba(20,16,12,0.12)]">
                    <MapPin className="h-5 w-5" />
                    Open in Google Maps
                  </div>
                </div>
              </a>
              {locationText ? (
                <p className="mt-5 text-[18px] font-semibold leading-8 text-[var(--text-1)]">{locationText}</p>
              ) : null}
              {business.parking_notes ? (
                <p className="mt-2 text-[15px] leading-7 text-[var(--text-3)]">{business.parking_notes}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
