import { auth } from '@/lib/auth/server';

import AccountChooser from './_components/account-chooser';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, session } = await auth();

  if (!user || !session) {
    return <AccountChooser />;
  }

  return <>{children}</>;
}
