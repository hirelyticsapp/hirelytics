import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const headerlist = await headers();
  const session = await auth.api.getSession({
    headers: headerlist,
  });

  if (session) {
    redirect('/console');
  }

  return <> {children}</>;
}
