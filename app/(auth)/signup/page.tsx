'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<'google' | 'magic' | null>(null);

  async function handleGoogleSignUp() {
    setLoading('google');
    setError(null);
    setMessage(null);

    const redirectTo = `${window.location.origin}/callback`;
    const { error: signUpError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(null);
    }
  }

  async function handleMagicLinkSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading('magic');
    setError(null);
    setMessage(null);

    const redirectTo = `${window.location.origin}/callback`;
    const { error: signUpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(null);
      return;
    }

    setMessage('Check your email for the magic link to finish sign up.');
    setLoading(null);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--color-bg)] px-6">
      <div className="w-full max-w-md rounded-[32px] border border-[var(--color-border)] bg-white p-8 shadow-[0_24px_80px_rgba(12,11,9,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold-dark)]">Owner sign up</p>
        <h1 className="mt-3 font-display text-6xl leading-[0.95]">Create your owner account.</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
          Sign up with Google or magic link to start onboarding and launch your BisLink.
        </p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading !== null}
            className="w-full rounded-2xl bg-[var(--color-void)] px-4 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === 'google' ? 'Redirecting to Google...' : 'Continue with Google'}
          </button>

          <form onSubmit={handleMagicLinkSignUp} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="owner@bislink.app"
              className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-4 text-sm outline-none transition-colors focus:border-[var(--color-gold-dark)]"
            />
            <button
              type="submit"
              disabled={loading !== null}
              className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading === 'magic' ? 'Sending magic link...' : 'Email me a magic link'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-sm text-[var(--color-text-secondary)]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[var(--color-text-primary)] underline underline-offset-2">
            Sign in
          </Link>
        </p>

        {message ? <p className="mt-4 text-sm text-green-700">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </div>
    </main>
  );
}
