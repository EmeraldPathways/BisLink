import Link from 'next/link';
import type { ActivationStatus } from '@/lib/agents/types';

export function ActivationNudgeCard({
  activationStatus
}: {
  activationStatus: ActivationStatus;
}) {
  return (
    <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
            Activation
          </p>
          <h2 className="mt-2 font-display text-3xl">
            Your BisLink page is {activationStatus.activationScore}% ready.
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Next step: {activationStatus.nextBestAction}
          </p>
          {activationStatus.nextBestActionReason ? (
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {activationStatus.nextBestActionReason}
            </p>
          ) : null}
        </div>

        {activationStatus.nextBestActionHref ? (
          <Link
            href={activationStatus.nextBestActionHref}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white"
          >
            Complete next step
          </Link>
        ) : null}
      </div>
    </section>
  );
}
