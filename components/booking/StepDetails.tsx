'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { formatPrice, formatTimeLabel } from '@/lib/utils/formatting';
import type { BusinessProfile } from '@/types';
import type { Service } from './BookingPage';

export function StepDetails({
  business,
  service,
  date,
  time,
  onNext
}: {
  business: BusinessProfile;
  service: Service;
  date: string;
  time: string;
  onBack: () => void;
  onNext: (details: { name: string; email: string; phone?: string }) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const fields: Array<{
    label: string;
    placeholder: string;
    value: string;
    setValue: (value: string) => void;
    type: 'text' | 'email' | 'tel';
  }> = [
    { label: 'Full Name', placeholder: 'Alex Johnson', value: name, setValue: setName, type: 'text' },
    { label: 'Email Address', placeholder: 'alex@example.com', value: email, setValue: setEmail, type: 'email' },
    { label: 'Phone', placeholder: '+1 (555) 000-0000', value: phone, setValue: setPhone, type: 'tel' }
  ];

  return (
    <div>
      <h3 className="font-display text-[26px] font-semibold">Your details</h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Just the basics - no account needed</p>

      <div className="mt-5 space-y-4">
        {fields.map((field) => (
          <label key={field.label} className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.09em] text-[#666]">{field.label}</span>
            <input
              type={field.type}
              value={field.value}
              placeholder={field.placeholder}
              onChange={(event) => field.setValue(event.target.value)}
              className="gold-ring w-full rounded-[13px] border-[1.5px] border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-[14px] text-[15px] outline-none focus:border-[var(--color-void)]"
            />
          </label>
        ))}
      </div>

      <div className="mt-5 rounded-[15px] bg-[var(--color-surface-2)] px-[18px] py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{service.name}</p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{format(new Date(`${date}T00:00:00`), 'EEE, d MMM')}</p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {formatTimeLabel(new Date(`${date}T${time}:00`), business.timezone)} - {service.duration_minutes} min
            </p>
          </div>
        </div>
        <div className="my-4 h-px bg-[var(--color-border-2)]" />
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold">Total due</span>
          <span className="text-[18px] font-bold">{formatPrice(service.price, service.currency)}</span>
        </div>
      </div>

      <button
        disabled={!name || !email}
        onClick={() => onNext({ name, email, phone: phone || undefined })}
        className="mt-6 w-full rounded-2xl bg-[var(--color-void)] px-4 py-4 text-sm font-semibold text-white disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-tertiary)]"
      >
        Continue to Payment
      </button>
    </div>
  );
}
