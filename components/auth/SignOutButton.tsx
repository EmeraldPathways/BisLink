'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton({
  redirectTo,
  label = 'Sign out',
  className
}: {
  redirectTo: string;
  label?: string;
  className?: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <button type="button" onClick={handleSignOut} disabled={loading} className={className}>
      <LogOut className="h-4 w-4" />
      {loading ? 'Signing out...' : label}
    </button>
  );
}
