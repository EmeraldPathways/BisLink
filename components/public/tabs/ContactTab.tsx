'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight, Globe, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { BusinessProfile, PublicContactSubmission } from '@/types';

type FormErrors = Partial<Record<'senderName' | 'senderEmail' | 'message', string>>;

function normalizePhone(value: string | null | undefined) {
  return (value ?? '').replace(/[^\d]/g, '');
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
    <section id={id} className="scroll-mt-20 space-y-4 px-2 pb-10 pt-6">
      <div className="px-3">
        <h2 className="font-display text-[28px] leading-[1.02] text-[var(--text-1)]">Contact</h2>
      </div>

      {rows.length ? (
        <div className="grid grid-cols-2 gap-3">
          {rows.map((row) => (
            <a
              key={row.label}
              href={row.href}
              target={row.href.startsWith('http') ? '_blank' : undefined}
              rel={row.href.startsWith('http') ? 'noreferrer' : undefined}
              className="flex min-h-[92px] flex-col justify-between rounded-[22px] border-[1.5px] border-[var(--border)] bg-[var(--page-card-bg)] p-4 shadow-[var(--card-shadow)] transition hover:-translate-y-0.5 hover:shadow-[var(--card-hover-shadow)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[var(--page-surface-muted)] text-[var(--accent-strong)]">
                  <row.icon className="h-4 w-4" />
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--page-surface-muted)] text-[var(--accent-strong)]">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-4 line-clamp-2 break-words text-sm font-semibold leading-5 text-[var(--text-1)]">
                {row.value}
              </p>
            </a>
          ))}
        </div>
      ) : null}

      <div className="rounded-[var(--card-radius)] border-[1.5px] border-[var(--border)] bg-[var(--page-card-bg)] p-5 shadow-[var(--card-shadow)]">
        <h3 className="font-display text-[19px] text-[var(--text-1)]">Send a message</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
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

          <div className="space-y-1">
            <label htmlFor="contact-name" className="text-sm font-medium text-[var(--text-1)]">
              Name
            </label>
            <input
              id="contact-name"
              value={form.senderName}
              onChange={(event) => {
                setForm((current) => ({ ...current, senderName: event.target.value }));
                setErrors((current) => ({ ...current, senderName: undefined }));
              }}
              className="w-full rounded-[13px] border-[1.5px] border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3"
              required
              minLength={2}
            />
            {errors.senderName ? <p className="text-sm text-red-600">{errors.senderName}</p> : null}
          </div>

          <div className="space-y-1">
            <label htmlFor="contact-email" className="text-sm font-medium text-[var(--text-1)]">
              Email
            </label>
            <input
              id="contact-email"
              value={form.senderEmail}
              onChange={(event) => {
                setForm((current) => ({ ...current, senderEmail: event.target.value }));
                setErrors((current) => ({ ...current, senderEmail: undefined }));
              }}
              className="w-full rounded-[13px] border-[1.5px] border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3"
              type="email"
              required
            />
            {errors.senderEmail ? <p className="text-sm text-red-600">{errors.senderEmail}</p> : null}
          </div>

          <div className="space-y-1">
            <label htmlFor="contact-message" className="text-sm font-medium text-[var(--text-1)]">
              Message
            </label>
            <textarea
              id="contact-message"
              value={form.message}
              onChange={(event) => {
                setForm((current) => ({ ...current, message: event.target.value }));
                setErrors((current) => ({ ...current, message: undefined }));
              }}
              className="min-h-[120px] w-full rounded-[13px] border-[1.5px] border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3"
              required
              minLength={10}
            />
            {errors.message ? <p className="text-sm text-red-600">{errors.message}</p> : null}
          </div>

          {message ? <p className="text-sm text-green-700">{message}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            disabled={loading}
            className="w-full rounded-[18px] bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(139,104,37,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      <div className="rounded-[var(--card-radius)] border-[1.5px] border-[var(--border)] bg-[var(--page-card-bg)] p-5 shadow-[var(--card-shadow)]">
        <h3 className="font-display text-[28px] text-[var(--text-1)]">Location</h3>
        {hasLocation ? (
          <>
            <a
              href={mapHref ?? '#'}
              target="_blank"
              rel="noreferrer"
              className={`mt-4 block overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--page-surface)] ${mapHref ? '' : 'pointer-events-none'}`}
            >
              <div className="relative flex min-h-[170px] items-center justify-center overflow-hidden px-5 text-center text-[var(--accent-strong)]">
                <div className="absolute inset-0 bg-[#dfeefc]" />
                <svg
                  aria-hidden="true"
                  viewBox="0 0 320 180"
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full opacity-30"
                  style={{ color: 'color-mix(in srgb, var(--accent-strong) 22%, white)' }}
                >
                  <g fill="none" stroke="currentColor" strokeWidth="1.1">
                    {Array.from({ length: 9 }).map((_, index) => (
                      <line key={`h-${index}`} x1="0" y1={20 + index * 20} x2="320" y2={20 + index * 20} />
                    ))}
                    {Array.from({ length: 11 }).map((_, index) => (
                      <line key={`v-${index}`} x1={20 + index * 28} y1="0" x2={20 + index * 28} y2="180" />
                    ))}
                  </g>
                </svg>
                <div className="relative flex items-center gap-3 rounded-full border border-[color:color-mix(in_srgb,var(--border)_70%,white)] bg-white px-6 py-3 text-base font-semibold text-[color:color-mix(in_srgb,var(--accent-strong)_88%,#0f766e)] shadow-[0_12px_30px_rgba(20,16,12,0.08)]">
                  <MapPin className="h-5 w-5" />
                  Open in Google Maps
                </div>
              </div>
            </a>
            {locationText ? (
              <p className="mt-5 text-[18px] font-semibold leading-8 text-[var(--text-1)]">
                {locationText}
              </p>
            ) : null}
            {business.parking_notes ? (
              <p className="mt-3 text-[16px] leading-8 text-[var(--text-3)]">{business.parking_notes}</p>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
