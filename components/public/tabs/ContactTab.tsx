'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight, Globe, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
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
    <section id={id} className="scroll-mt-20 space-y-5 px-2 pb-10 pt-6">
      <div className="px-3">
        <h2 className="font-display text-[46px] leading-[0.92] tracking-[-0.03em] text-[var(--text-1)]">Contact</h2>
        <p className="mt-3 text-[17px] leading-8 text-[var(--text-3)]">Get in touch - I&apos;d love to hear from you.</p>
      </div>

      <div className="rounded-[30px] border border-[var(--page-border)] bg-[var(--page-card-bg)] px-4 py-4 shadow-[var(--card-shadow)]">
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
        <div className="grid grid-cols-2 gap-4">
          {rows.map((row) => (
            <a
              key={row.label}
              href={row.href}
              target={row.href.startsWith('http') ? '_blank' : undefined}
              rel={row.href.startsWith('http') ? 'noreferrer' : undefined}
              className="rounded-[30px] border border-[var(--page-border)] bg-[var(--page-card-bg)] px-5 py-6 shadow-[var(--card-shadow)] transition hover:-translate-y-0.5 hover:shadow-[var(--card-hover-shadow)]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),var(--page-surface-muted))] text-[var(--accent-strong)]">
                  <row.icon className="h-10 w-10" strokeWidth={1.5} />
                </div>
                <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">{row.label}</p>
              </div>
              <div className="mt-5 h-px bg-[color:color-mix(in_srgb,var(--page-border)_88%,white)]" />
              <div className="mt-6 flex items-end justify-between gap-3">
                <p className="min-w-0 flex-1 break-words text-[15px] font-semibold leading-6 text-[var(--text-1)]">
                  {formatContactValue(row.label, row.value)}
                </p>
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-[var(--page-surface-muted)] text-[var(--accent-strong)]">
                  <ArrowUpRight className="h-6 w-6" />
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : null}

      {hasLocation ? (
        <div className="rounded-[30px] border border-[var(--page-border)] bg-[var(--page-card-bg)] p-5 shadow-[var(--card-shadow)]">
          <h3 className="font-display text-[30px] leading-none text-[var(--text-1)]">Location</h3>
          <a
            href={mapHref ?? '#'}
            target="_blank"
            rel="noreferrer"
            className={`mt-4 block overflow-hidden rounded-[24px] border border-[var(--page-border)] bg-[#ebefe6] ${mapHref ? '' : 'pointer-events-none'}`}
          >
            <div className="relative min-h-[210px] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.75),transparent_28%),linear-gradient(180deg,#eef2e8_0%,#dde6d7_100%)]" />
              <svg
                aria-hidden="true"
                viewBox="0 0 360 220"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
              >
                <g fill="none" stroke="rgba(96,122,96,0.22)" strokeWidth="5" strokeLinecap="round">
                  <path d="M-20 46 C40 30, 84 58, 142 44 S246 22, 380 52" />
                  <path d="M-10 110 C48 92, 118 134, 188 114 S294 80, 382 120" />
                  <path d="M-10 180 C82 156, 112 206, 202 182 S302 152, 382 190" />
                  <path d="M62 -20 C74 46, 48 70, 68 130 S88 210, 72 242" />
                  <path d="M152 -10 C162 38, 134 88, 164 132 S180 206, 164 240" />
                  <path d="M252 -16 C270 44, 226 90, 254 144 S274 210, 260 242" />
                </g>
                <g fill="none" stroke="rgba(191,162,94,0.42)" strokeWidth="9" strokeLinecap="round">
                  <path d="M-8 76 C44 78, 110 58, 172 72 S286 94, 372 80" />
                  <path d="M108 -10 C102 36, 128 84, 118 126 S96 204, 108 240" />
                </g>
                <g fill="rgba(122,148,123,0.18)">
                  <circle cx="42" cy="42" r="16" />
                  <circle cx="318" cy="48" r="22" />
                  <circle cx="300" cy="178" r="18" />
                  <circle cx="210" cy="154" r="14" />
                </g>
                <g fill="rgba(88,102,122,0.18)">
                  <rect x="186" y="34" width="42" height="24" rx="5" />
                  <rect x="226" y="118" width="34" height="20" rx="4" />
                  <rect x="88" y="148" width="28" height="18" rx="4" />
                  <rect x="130" y="88" width="26" height="18" rx="4" />
                </g>
              </svg>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_52%,rgba(255,255,255,0.24)_100%)]" />
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
    </section>
  );
}
