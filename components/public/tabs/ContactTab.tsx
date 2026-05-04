'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, Globe, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { BusinessProfile, PublicContactSubmission } from '@/types';
import { SocialIconLinks } from '../SocialIconLinks';

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

  const hasLocation = Boolean(business.address || business.location || business.google_maps_url);
  const mapHref =
    business.google_maps_url ??
    (business.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}` : null);

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
        <h2 className="font-display text-3xl text-[var(--text-1)]">Contact</h2>
        <p className="mt-1 text-sm text-[var(--text-3)]">Send a message or connect on social.</p>
      </div>

      <div className="rounded-[var(--card-radius)] border-[1.5px] border-[var(--border)] bg-[var(--page-card-bg)] p-5 shadow-[var(--card-shadow)]">
        {rows.length
          ? rows.map((row) => (
              <a
                key={row.label}
                href={row.href}
                target={row.href.startsWith('http') ? '_blank' : undefined}
                rel={row.href.startsWith('http') ? 'noreferrer' : undefined}
                className="flex items-center justify-between border-b border-[var(--border)] py-4 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--page-surface-muted)] text-[var(--accent-strong)]">
                    <row.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-1)]">{row.label}</p>
                    <p className="text-sm text-[var(--text-3)]">{row.value}</p>
                  </div>
                </div>
                <span className="text-[var(--text-3)]">{'->'}</span>
              </a>
            ))
          : null}
        <SocialIconLinks business={business} variant="contact" />
      </div>

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
          <button disabled={loading} className="w-full rounded-[var(--button-radius)] bg-[var(--cta-bg)] px-5 py-4 text-sm font-semibold text-[var(--cta-text)] disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      <div className="rounded-[var(--card-radius)] border-[1.5px] border-[var(--border)] bg-[var(--page-card-bg)] p-5 shadow-[var(--card-shadow)]">
        <h3 className="font-display text-[19px] text-[var(--text-1)]">Location</h3>
        {hasLocation ? (
          <>
            {mapHref ? (
              <a
                href={mapHref}
                target="_blank"
                rel="noreferrer"
                className="mt-4 block overflow-hidden rounded-[16px] border border-[var(--border)] bg-[image:var(--media-gradient)]"
              >
                <div className="relative flex min-h-[132px] items-center justify-center overflow-hidden px-5 text-center text-[var(--accent-strong)]">
                  <div className="absolute inset-0 bg-[image:var(--grid-pattern)] opacity-40 [background-size:28px_28px]" />
                  <div className="relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--page-card-bg) 90%, transparent)' }}>
                    <MapPin className="h-4 w-4" />
                    Open in Google Maps
                  </div>
                </div>
              </a>
            ) : null}
            <p className="mt-4 text-sm font-semibold text-[var(--text-1)]">{business.address ?? business.location}</p>
            {business.parking_notes ? <p className="mt-2 text-sm leading-6 text-[var(--text-3)]">{business.parking_notes}</p> : null}
            {mapHref ? (
              <a href={mapHref} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-strong)]">
                Open in Maps
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
