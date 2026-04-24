import { createAdminClient } from '@/lib/supabase/server';
import type { Json } from '@/lib/supabase/types';

export type AppLogLevel = 'log' | 'warn' | 'error';

type AppLogContext = Record<string, Json | undefined>;

type AppLogInput = {
  level: AppLogLevel;
  source: string;
  event: string;
  message?: string;
  context?: AppLogContext;
};

export async function writeAppLog({
  level,
  source,
  event,
  message,
  context,
}: AppLogInput) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return;
    }

    const payload = {
      level,
      source,
      event,
      message: message ?? null,
      context: sanitizeContext(context),
    };

    const { error } = await supabase.from('app_logs').insert(payload);
    if (!error) {
      return;
    }

    console.error('[app-logs] Failed to persist app log', {
      source,
      event,
      error: error.message,
    });
  } catch (error) {
    console.error('[app-logs] Failed to persist app log', {
      source,
      event,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function sanitizeContext(context: AppLogContext | undefined) {
  if (!context) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(context).filter(([, value]) => value !== undefined),
  );
}
