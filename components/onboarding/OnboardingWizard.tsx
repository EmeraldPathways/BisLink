'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { businessCategories } from '@/lib/business-options';
import { createDefaultAvailability, createDefaultServices, type DraftAvailability, type DraftService } from '@/lib/onboarding-defaults';
import { generateSlug } from '@/lib/utils/slugify';

type BusinessDraft = {
  name: string;
  category: string;
  bio: string;
  location: string;
  slug: string;
};

type PersistedOnboarding = {
  id: string;
  name: string;
  category: string;
  bio: string | null;
  location: string | null;
  slug: string;
  services?: Array<{
    emoji: string | null;
    name: string;
    description: string | null;
    duration_minutes: number;
    price: number;
    tag: string | null;
  }>;
  availability?: Array<{
    day_of_week: number;
    is_active: boolean;
    start_time: string;
    end_time: string;
  }>;
};

const totalSteps = 5;

export function OnboardingWizard() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [business, setBusiness] = useState<BusinessDraft>({
    name: '',
    category: 'Personal Training',
    bio: '',
    location: '',
    slug: ''
  });
  const [services, setServices] = useState<DraftService[]>(() => createDefaultServices('Personal Training'));
  const [availability, setAvailability] = useState<DraftAvailability[]>(() => createDefaultAvailability());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch('/api/owner/onboarding', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { onboarding: PersistedOnboarding | null };
      if (cancelled || !data.onboarding) return;

      setBusiness({
        name: data.onboarding.name,
        category: data.onboarding.category,
        bio: data.onboarding.bio ?? '',
        location: data.onboarding.location ?? '',
        slug: data.onboarding.slug
      });
      setSlugTouched(true);
      if (data.onboarding.services?.length) {
        setServices(
          data.onboarding.services.map((service) => ({
            emoji: service.emoji ?? '✨',
            name: service.name,
            description: service.description ?? '',
            duration_minutes: service.duration_minutes,
            price: service.price,
            tag: service.tag
          }))
        );
      }
      if (data.onboarding.availability?.length === 7) {
        setAvailability(
          data.onboarding.availability
            .sort((a, b) => a.day_of_week - b.day_of_week)
            .map((item) => ({
              day_of_week: item.day_of_week,
              is_active: item.is_active,
              start_time: item.start_time.slice(0, 5),
              end_time: item.end_time.slice(0, 5)
            }))
        );
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!slugTouched) {
      setBusiness((currentState) => ({ ...currentState, slug: generateSlug(currentState.name) }));
    }
  }, [business.name, slugTouched]);

  useEffect(() => {
    setServices((currentServices) => {
      if (currentServices.length && currentServices.some((service) => service.name.trim())) {
        return currentServices;
      }
      return createDefaultServices(business.category);
    });
  }, [business.category]);

  const publicLink = useMemo(() => {
    if (typeof window === 'undefined') return business.slug;
    return `${window.location.origin}/${business.slug}`;
  }, [business.slug]);

  function updateBusiness<K extends keyof BusinessDraft>(key: K, value: BusinessDraft[K]) {
    setBusiness((currentState) => ({ ...currentState, [key]: value }));
  }

  function updateService(index: number, patch: Partial<DraftService>) {
    setServices((currentServices) => currentServices.map((service, serviceIndex) => (serviceIndex === index ? { ...service, ...patch } : service)));
  }

  function addService() {
    setServices((currentServices) => [
      ...currentServices,
      { emoji: '✨', name: '', description: '', duration_minutes: 60, price: 10000, tag: null }
    ]);
  }

  function removeService(index: number) {
    setServices((currentServices) => (currentServices.length > 1 ? currentServices.filter((_, serviceIndex) => serviceIndex !== index) : currentServices));
  }

  function updateAvailability(index: number, patch: Partial<DraftAvailability>) {
    setAvailability((currentAvailability) => currentAvailability.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  async function persistOnboarding() {
    const payload = {
      business,
      services,
      availability
    };

    const res = await fetch('/api/owner/onboarding', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) {
      throw new Error(data?.error ?? 'Failed to save onboarding');
    }
  }

  async function handleContinue() {
    setError(null);
    setMessage(null);
    try {
      if (current < 3) {
        await persistOnboarding();
      }
      setCurrent((value) => Math.min(value + 1, totalSteps - 1));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save onboarding');
    }
  }

  async function handleStripeConnect() {
    setError(null);
    setMessage(null);
    try {
      await persistOnboarding();
      const res = await fetch('/api/stripe/connect');
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'Failed to start Stripe onboarding');
      }
      window.location.href = data.url;
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : 'Failed to start Stripe onboarding');
    }
  }

  async function handleSkipPayments() {
    setError(null);
    setMessage(null);
    try {
      await persistOnboarding();
      setCurrent(4);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save onboarding');
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(publicLink);
    setMessage('Link copied');
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[32px] bg-[var(--color-void)] p-8 text-[var(--color-text-hero)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-gold)]">Launch in under 10 minutes</p>
        <h1 className="mt-3 font-display text-6xl leading-[0.96]">Turn one link into your whole business.</h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-[var(--color-text-hero-2)]">
          Set up your business basics, first services, availability, and payments. Then publish a link you can drop straight into TikTok and Instagram.
        </p>
      </div>
      <div className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
        {current === 0 ? (
          <BusinessStep business={business} onChange={updateBusiness} onSlugTouched={() => setSlugTouched(true)} />
        ) : null}
        {current === 1 ? <ServicesStep services={services} onAdd={addService} onChange={updateService} onRemove={removeService} /> : null}
        {current === 2 ? <AvailabilityStep availability={availability} onChange={updateAvailability} /> : null}
        {current === 3 ? <PaymentsStep onConnect={handleStripeConnect} onSkip={handleSkipPayments} pending={isPending} /> : null}
        {current === 4 ? <DoneStep publicLink={publicLink} onCopy={copyLink} onDashboard={() => router.push('/dashboard')} onOpen={() => window.open(publicLink, '_blank', 'noopener,noreferrer')} /> : null}

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        {message ? <p className="mt-4 text-sm text-green-700">{message}</p> : null}

        {current < 4 ? (
          <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] mt-6 flex items-center justify-between rounded-[24px] bg-[var(--color-bg)]/95 py-3 backdrop-blur md:static md:rounded-none md:bg-transparent md:py-0 md:backdrop-blur-none">
            <button disabled={current === 0 || isPending} onClick={() => setCurrent((value) => Math.max(value - 1, 0))} className="rounded-2xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold disabled:opacity-40">
              Back
            </button>
            {current < 3 ? (
              <button onClick={handleContinue} disabled={isPending} className="rounded-2xl bg-[var(--color-void)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                Continue
              </button>
            ) : (
              <span className="text-sm text-[var(--color-text-secondary)]">Choose how to finish setup</span>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function BusinessStep({
  business,
  onChange,
  onSlugTouched
}: {
  business: BusinessDraft;
  onChange: <K extends keyof BusinessDraft>(key: K, value: BusinessDraft[K]) => void;
  onSlugTouched: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-dark)]">Step 1 of 5</p>
        <h2 className="mt-2 font-display text-5xl">Your business</h2>
      </div>
      <input className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-4" value={business.name} onChange={(event) => onChange('name', event.target.value)} placeholder="Business name" />
      <select className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-4" value={business.category} onChange={(event) => onChange('category', event.target.value)}>
        {businessCategories.map((category) => (
          <option key={category}>{category}</option>
        ))}
      </select>
      <textarea className="min-h-[110px] w-full rounded-2xl border border-[var(--color-border)] px-4 py-4" value={business.bio} onChange={(event) => onChange('bio', event.target.value)} placeholder="What do you do and who is it for?" />
      <input className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-4" value={business.location} onChange={(event) => onChange('location', event.target.value)} placeholder="Location" />
      <input
        className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-4"
        value={business.slug}
        onChange={(event) => {
          onSlugTouched();
          onChange('slug', generateSlug(event.target.value));
        }}
        placeholder="Slug"
      />
    </div>
  );
}

function ServicesStep({
  services,
  onAdd,
  onChange,
  onRemove
}: {
  services: DraftService[];
  onAdd: () => void;
  onChange: (index: number, patch: Partial<DraftService>) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-dark)]">Step 2 of 5</p>
        <h2 className="mt-2 font-display text-5xl">Your services</h2>
      </div>
      <p className="text-sm leading-7 text-[var(--color-text-secondary)]">Start with the core offers customers should be able to book on day one.</p>
      <div className="space-y-3">
        {services.map((service, index) => (
          <div key={`${service.name}-${index}`} className="rounded-[22px] border border-[var(--color-border)] bg-white p-5">
            <div className="grid gap-3 md:grid-cols-[84px_1fr]">
              <input value={service.emoji} onChange={(event) => onChange(index, { emoji: event.target.value })} className="rounded-2xl border border-[var(--color-border)] px-4 py-4 text-center" placeholder="✨" />
              <div className="grid gap-3">
                <input value={service.name} onChange={(event) => onChange(index, { name: event.target.value })} className="rounded-2xl border border-[var(--color-border)] px-4 py-4" placeholder="Service name" />
                <textarea value={service.description} onChange={(event) => onChange(index, { description: event.target.value })} className="min-h-[90px] rounded-2xl border border-[var(--color-border)] px-4 py-4" placeholder="Description" />
                <div className="grid gap-3 sm:grid-cols-3">
                  <input type="number" min="5" step="5" value={service.duration_minutes} onChange={(event) => onChange(index, { duration_minutes: Number(event.target.value) })} className="rounded-2xl border border-[var(--color-border)] px-4 py-4" placeholder="Minutes" />
                  <input type="number" min="0" step="0.01" value={service.price / 100} onChange={(event) => onChange(index, { price: Math.round(Number(event.target.value || '0') * 100) })} className="rounded-2xl border border-[var(--color-border)] px-4 py-4" placeholder="Price" />
                  <input value={service.tag ?? ''} onChange={(event) => onChange(index, { tag: event.target.value || null })} className="rounded-2xl border border-[var(--color-border)] px-4 py-4" placeholder="Tag (optional)" />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => onRemove(index)} disabled={services.length === 1} className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-medium disabled:opacity-40">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={onAdd} className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold">
        Add another service
      </button>
    </div>
  );
}

function AvailabilityStep({
  availability,
  onChange
}: {
  availability: DraftAvailability[];
  onChange: (index: number, patch: Partial<DraftAvailability>) => void;
}) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-dark)]">Step 3 of 5</p>
        <h2 className="mt-2 font-display text-5xl">Your availability</h2>
      </div>
      {availability.map((record, index) => (
        <div key={days[index]} className="grid grid-cols-[70px_72px_1fr_1fr] items-center gap-3 rounded-[22px] border border-[var(--color-border)] bg-white px-4 py-4">
          <span className="font-semibold">{days[index]}</span>
          <button
            type="button"
            onClick={() => onChange(index, { is_active: !record.is_active })}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${record.is_active ? 'bg-[var(--color-void)] text-white' : 'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]'}`}
          >
            {record.is_active ? 'On' : 'Off'}
          </button>
          <input type="time" disabled={!record.is_active} value={record.start_time} onChange={(event) => onChange(index, { start_time: event.target.value })} className="rounded-xl bg-[var(--color-surface-2)] px-3 py-2 text-sm disabled:opacity-50" />
          <input type="time" disabled={!record.is_active} value={record.end_time} onChange={(event) => onChange(index, { end_time: event.target.value })} className="rounded-xl bg-[var(--color-surface-2)] px-3 py-2 text-sm disabled:opacity-50" />
        </div>
      ))}
    </div>
  );
}

function PaymentsStep({ onConnect, onSkip, pending }: { onConnect: () => void; onSkip: () => void; pending: boolean }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-dark)]">Step 4 of 5</p>
        <h2 className="mt-2 font-display text-5xl">Get paid</h2>
      </div>
      <div className="rounded-[26px] bg-[var(--color-void)] p-6 text-[var(--color-text-hero)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold)]">Stripe Connect Express</p>
        <p className="mt-3 text-sm leading-7 text-[var(--color-text-hero-2)]">
          Connect Stripe now to accept bookings immediately, or skip and finish setup first.
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={onConnect} disabled={pending} className="rounded-2xl bg-[var(--color-gold)] px-4 py-3 text-sm font-semibold text-[var(--color-void)] disabled:opacity-60">
            Connect Stripe
          </button>
          <button onClick={onSkip} disabled={pending} className="rounded-2xl border border-[var(--color-border-dark)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

function DoneStep({
  publicLink,
  onCopy,
  onOpen,
  onDashboard
}: {
  publicLink: string;
  onCopy: () => void;
  onOpen: () => void;
  onDashboard: () => void;
}) {
  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-[var(--color-void)] to-[#2a2620] text-[var(--color-gold)]">
        <span className="text-4xl">✓</span>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-dark)]">Step 5 of 5</p>
        <h2 className="mt-2 font-display text-5xl">You&apos;re live</h2>
      </div>
      <div className="rounded-[22px] bg-[var(--color-surface-2)] px-4 py-5">
        <p className="text-sm text-[var(--color-text-secondary)]">Your new public link</p>
        <p className="mt-2 text-lg font-semibold break-all">{publicLink}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button onClick={onCopy} className="rounded-2xl bg-[var(--color-void)] px-5 py-3 text-sm font-semibold text-white">
          Copy Link
        </button>
        <button onClick={onOpen} className="rounded-2xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold">
          Open Link
        </button>
        <button onClick={onDashboard} className="rounded-2xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold">
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
