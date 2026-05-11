'use client';

import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { formatTimeLabel } from '@/lib/utils/formatting';
import type { BusinessProfile } from '@/types';
import type { Service } from './BookingPage';

export function StepTime({
  business,
  service,
  date,
  onNext,
}: {
  business: BusinessProfile;
  service: Service;
  date: string;
  onBack: () => void;
  onNext: (time: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [timezone, setTimezone] = useState(business.timezone);
  const [openingHours, setOpeningHours] = useState<{ start: string; end: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAvailability() {
      setLoading(true);
      setError(null);
      setSelected(null);

      try {
        const params = new URLSearchParams({
          businessId: business.id,
          serviceId: service.id,
          date,
        });
        const response = await fetch(`/api/availability?${params.toString()}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as {
          available?: string[];
          timezone?: string;
          openingHours?: { start: string; end: string } | null;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || 'Could not load availability');
        }

        setSlots((payload.available ?? []).slice(0, 8));
        setTimezone(payload.timezone ?? business.timezone);
        setOpeningHours(payload.openingHours ?? null);
      } catch (fetchError) {
        if (controller.signal.aborted) return;

        setSlots([]);
        setTimezone(business.timezone);
        setOpeningHours(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Could not load availability',
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadAvailability();

    return () => controller.abort();
  }, [business.id, business.timezone, date, service.id]);

  const helperText = useMemo(() => {
    if (loading) return 'Checking live availability...';
    if (error) return error;
    if (!slots.length) return 'No available slots for this date.';
    const openingLabel =
      openingHours
        ? `${formatTimeLabel(new Date(`${date}T${openingHours.start}:00`), timezone)} - ${formatTimeLabel(new Date(`${date}T${openingHours.end}:00`), timezone)}`
        : null;
    return openingLabel
      ? `${format(new Date(`${date}T00:00:00`), 'EEE, d MMM')} - Open ${openingLabel}`
      : `${format(new Date(`${date}T00:00:00`), 'EEE, d MMM')} - ${service.duration_minutes} min`;
  }, [date, error, loading, openingHours, service.duration_minutes, slots.length, timezone]);

  return (
    <div>
      <h3 className="font-display text-[26px] font-semibold">Choose a time</h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        {helperText}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {slots.map((slot) => {
          const active = selected === slot;
          return (
            <button
              key={slot}
              type="button"
              disabled={loading}
              onClick={() => setSelected(slot)}
              className={`rounded-xl border px-3 py-3 text-sm font-medium ${
                active
                  ? 'border-[var(--cta-bg)] bg-[var(--cta-bg)] text-[var(--cta-text)]'
                  : 'border-[var(--input-border)] bg-[var(--page-card-bg)] text-[var(--color-text-primary)]'
              }`}
            >
              {formatTimeLabel(new Date(`${date}T${slot}:00`), timezone)}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={!selected || loading || Boolean(error)}
        onClick={() => selected && onNext(selected)}
        className="mt-6 w-full rounded-2xl bg-[var(--color-void)] px-4 py-4 text-sm font-semibold text-white disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-tertiary)]"
      >
        {selected
          ? `Continue - ${formatTimeLabel(new Date(`${date}T${selected}:00`), timezone)}`
          : loading
            ? 'Loading availability...'
            : error
              ? 'Availability unavailable'
              : 'Select a time to continue'}
      </button>
    </div>
  );
}
