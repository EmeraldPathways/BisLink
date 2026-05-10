'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ImageUploadField } from '@/components/dashboard/ImageUploadField';
import type { ServiceRecord } from '@/types';

type ServiceFormState = {
  name: string;
  description: string;
  duration_minutes: string;
  price: string;
  image_url: string;
};

export function ServiceForm({ service }: { service?: ServiceRecord }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceFormState>(() => buildFormState(service));

  useEffect(() => {
    setForm(buildFormState(service));
    setError(null);
    setMessage(null);
  }, [service]);

  function updateField<K extends keyof ServiceFormState>(key: K, value: ServiceFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    setError(null);
    setMessage(null);
    const payload = {
      name: form.name,
      description: form.description,
      duration_minutes: Number(form.duration_minutes),
      price: Math.round(Number(form.price || '0') * 100),
      image_url: form.image_url,
    };

    const res = await fetch(service ? `/api/owner/services/${service.id}` : '/api/owner/services', {
      method: service ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = (await res.json().catch(() => null)) as { error?: unknown; service?: { id: string } } | null;
    if (!res.ok) {
      setError(formatApiError(data?.error) ?? 'Failed to save service');
      return;
    }

    setMessage(service ? 'Service updated' : 'Service created');
    startTransition(() => {
      router.push(data?.service?.id ? `${pathname}?edit=${data.service.id}` : pathname);
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-full rounded-[28px] border border-[var(--color-border)] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-4xl">{service ? 'Edit service' : 'Add service'}</h2>
        {service ? (
          <button
            onClick={() => router.push(pathname)}
            className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-medium"
            type="button"
          >
            New
          </button>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3">
        <input value={form.name} onChange={(event) => updateField('name', event.target.value)} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Name" />
        <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} className="min-h-[120px] w-full rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Description" />
        <ImageUploadField
          label="Service image"
          description="Shown on the public booking cards."
          value={form.image_url}
          kind="service"
          aspectHint="Square image recommended."
          onChange={(url) => updateField('image_url', url)}
        />
        <div className="grid grid-cols-2 gap-3">
          <input value={form.duration_minutes} onChange={(event) => updateField('duration_minutes', event.target.value)} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Duration" type="number" min="5" step="5" />
          <input value={form.price} onChange={(event) => updateField('price', event.target.value)} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Price" type="number" min="0" step="0.01" />
        </div>
        <button onClick={submit} disabled={isPending} className="rounded-2xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {service ? 'Save changes' : 'Create service'}
        </button>
        {message ? <p className="text-xs text-green-700">{message}</p> : null}
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

function buildFormState(service?: ServiceRecord): ServiceFormState {
  return {
    name: service?.name ?? '',
    description: service?.description ?? '',
    duration_minutes: service ? String(service.duration_minutes) : '60',
    price: service ? String(service.price / 100) : '',
    image_url: service?.image_url ?? ''
  };
}

function formatApiError(error: unknown) {
  if (typeof error === 'string') return error;
  if (!error || typeof error !== 'object') return null;

  const candidate = error as {
    formErrors?: string[];
    fieldErrors?: Record<string, string[] | undefined>;
  };

  const formMessage = candidate.formErrors?.find(Boolean);
  if (formMessage) return formMessage;

  const fieldMessage = Object.values(candidate.fieldErrors ?? {})
    .flat()
    .find(Boolean);
  return fieldMessage ?? null;
}
