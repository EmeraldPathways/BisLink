'use client';

import { useState } from 'react';

type GoogleCalendarConnectButtonProps = {
  connected: boolean;
};

const href = '/api/calendar/google?next=/calendar&format=json';

export function GoogleCalendarConnectButton({
  connected,
}: GoogleCalendarConnectButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch(href, { cache: 'no-store' });
      const data = (await response.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;

      if (!response.ok || !data?.url) {
        throw new Error(data?.error ?? 'Failed to start Google Calendar setup');
      }

      window.location.href = data.url;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to start Google Calendar setup',
      );
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={`inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ${
          connected ? 'btn-secondary' : 'btn-primary'
        }`}
      >
        {pending
          ? 'Opening Google Calendar...'
          : connected
            ? 'Reconnect Google Calendar'
            : 'Connect Google Calendar'}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
