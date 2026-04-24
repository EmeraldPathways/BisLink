import { redirect } from 'next/navigation';
import { SignupForm } from '@/components/auth/SignupForm';
import { getPostAuthRedirectPath } from '@/lib/auth-redirect';

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const redirectPath = await getPostAuthRedirectPath();

  if (redirectPath) {
    redirect(redirectPath);
  }

  return <SignupForm initialError={searchParams?.error ?? null} />;
}
