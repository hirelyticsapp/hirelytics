import { cookies } from 'next/headers';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AuthProvider } from '@/context/auth-context';
import { auth } from '@/lib/auth/server';

import AccountChooser from './_components/account-chooser';
import { AppSidebar } from './_components/app-sidebar';
import { SiteHeader } from './_components/site-header';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, session } = await auth();

  if (!user || !session) {
    return <AccountChooser />;
  }

  const cookieStore = await cookies();
  // Default to false if no cookie exists, otherwise use the cookie value
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <AuthProvider>
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}
