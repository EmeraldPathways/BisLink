'use client';

import { useState } from 'react';
import { Step1Business } from './Step1Business';
import { Step2Services } from './Step2Services';
import { Step3Availability } from './Step3Availability';
import { Step4Payments } from './Step4Payments';
import { Step5Done } from './Step5Done';

const steps = [Step1Business, Step2Services, Step3Availability, Step4Payments, Step5Done];

export function OnboardingWizard() {
  const [current, setCurrent] = useState(0);
  const CurrentStep = steps[current];

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[32px] bg-[var(--color-void)] p-8 text-[var(--color-text-hero)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-gold)]">Launch in under 10 minutes</p>
        <h1 className="mt-3 font-display text-6xl leading-[0.96]">Everything a service business needs, in one link.</h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-[var(--color-text-hero-2)]">
          Set up your business, add services, connect payments, and share a page that feels premium from the first tap.
        </p>
      </div>
      <div className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
        <CurrentStep />
        <div className="mt-6 flex items-center justify-between">
          <button disabled={current === 0} onClick={() => setCurrent((value) => value - 1)} className="rounded-2xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold disabled:opacity-40">
            Back
          </button>
          <button onClick={() => setCurrent((value) => Math.min(value + 1, steps.length - 1))} className="rounded-2xl bg-[var(--color-void)] px-5 py-3 text-sm font-semibold text-white">
            {current === steps.length - 1 ? 'Finish' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
