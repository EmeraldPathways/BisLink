'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { BusinessProfile, PublicContactSubmission } from '@/types';

export function ContactTab({ business }: { business: BusinessProfile }) {
  const [form, setForm] = useState({ senderName: '', senderEmail: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      [
        business.email ? { icon: Mail, label: 'Email', value: business.email, href: `mailto:${business.email}` } : null,
        business.phone || business.whatsapp_number
          ? {
              icon: Phone,
              label: business.phone ? 'Phone' : 'WhatsApp',
              value: business.phone ?? business.whatsapp_number ?? '',
              href: `tel:${business.phone ?? business.whatsapp_number ?? ''}`
            }
          : null,
        business.instagram_handle
          ? {
              icon: MessageCircle,
              label: 'Instagram',
              value: business.instagram_handle,
              href: `https://instagram.com/${business.instagram_handle.replace('@', '')}`
            }
          : null
      ].filter(Boolean) as Array<{ icon: typeof Mail; label: string; value: string; href: string }>,
    [business.email, business.instagram_handle, business.phone, business.whatsapp_number]
  );

  const hasLocation = Boolean(business.address || business.location || business.google_maps_url);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const payload: PublicContactSubmission = {
        businessId: business.id,
        senderName: form.senderName.trim(),
        senderEmail: form.senderEmail.trim(),
        message: form.message.trim()
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

      setForm({ senderName: '', senderEmail: '', message: '' });
      setMessage('Message sent successfully.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not send your message');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4 px-2 pb-10 pt-6">
      <div className="rounded-[18px] border-[1.5px] border-[var(--border)] bg-white p-5">
        {rows.length ? (
          rows.map((row) => (
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
          ))
        ) : (
          <p className="text-sm text-[var(--text-3)]">No direct contact channels are configured yet. Use the message form below.</p>
        )}
      </div>

      <div className="rounded-[18px] border-[1.5px] border-[var(--border)] bg-white p-5">
        <h3 className="font-display text-[19px] text-[var(--text-1)]">Send a message</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            value={form.senderName}
            onChange={(event) => setForm((current) => ({ ...current, senderName: event.target.value }))}
            className="w-full rounded-[13px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3"
            placeholder="Your Name"
            required
          />
          <input
            value={form.senderEmail}
            onChange={(event) => setForm((current) => ({ ...current, senderEmail: event.target.value }))}
            className="w-full rounded-[13px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3"
            placeholder="Email"
            type="email"
            required
          />
          <textarea
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
            className="min-h-[120px] w-full rounded-[13px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3"
            placeholder="Message"
            required
          />
          {message ? <p className="text-sm text-green-700">{message}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button disabled={loading} className="w-full rounded-[15px] bg-[var(--void)] px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      <div className="rounded-[18px] border-[1.5px] border-[var(--border)] bg-white p-5">
        <h3 className="font-display text-[19px] text-[var(--text-1)]">Location</h3>
        {hasLocation ? (
          <>
            <div className="mt-4 flex min-h-[120px] items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#F7F4EF,#EEE9DF)] px-5 text-center text-[var(--gold-dark)]">
              <MapPin className="mr-2 h-5 w-5" />
              {business.address ?? business.location}
            </div>
            <p className="mt-4 text-sm font-semibold text-[var(--text-1)]">{business.address ?? business.location}</p>
            {business.parking_notes ? <p className="mt-2 text-sm leading-6 text-[var(--text-3)]">{business.parking_notes}</p> : null}
            {business.google_maps_url ? (
              <a href={business.google_maps_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold-dark)]">
                Open in Maps
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </>
        ) : (
          <p className="mt-4 text-sm text-[var(--text-3)]">Location details are not configured yet.</p>
        )}
      </div>
    </section>
  );
}
