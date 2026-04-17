import Link from 'next/link';
import { redirect } from 'next/navigation';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { getPostAuthRedirectPath } from '@/lib/auth-redirect';
import { createClient } from '@/lib/supabase/server';

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--color-bg)] px-6 py-8">
        <div className="w-full max-w-xl rounded-[32px] border border-[var(--color-border)] bg-white p-8 shadow-[0_24px_80px_rgba(12,11,9,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold-dark)]">Sign up</p>
          <h1 className="mt-3 font-display text-6xl leading-[0.95]">Create your owner account.</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
            To start onboarding, continue to the owner sign-up page and create your account with Google or magic link.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-2xl bg-[var(--color-void)] px-5 py-3 text-sm font-semibold text-white"
            >
              Continue to Sign Up
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-2xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold"
            >
              View Demo Instead
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const redirectPath = await getPostAuthRedirectPath();
  if (redirectPath && redirectPath !== '/onboarding') {
    redirect(redirectPath);
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-6 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <OnboardingWizard />
      </div>
    </main>
  );
}
