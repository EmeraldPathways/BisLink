import { redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { getAdminUserForRequest } from '@/lib/admin';

export default async function AdminLoginPage() {
  const context = await getAdminUserForRequest();

  if (context?.isAdmin) {
    redirect('/admin');
  }

  if (context?.user && !context.isAdmin) {
    redirect('/dashboard');
  }

  return <AdminLoginForm />;
}
