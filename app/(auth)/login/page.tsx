import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { getPostAuthRedirectPath } from '@/lib/auth-redirect';

export default async function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  const redirectPath = await getPostAuthRedirectPath();

  if (redirectPath) {
    redirect(redirectPath);
  }

  return <LoginForm initialError={searchParams?.error ?? null} />;
}
