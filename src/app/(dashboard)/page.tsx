import { auth } from '@/lib/auth/server';

import DashboardComponents from './_components/dashboard';

export default async function Home() {
  const { user, session } = await auth();
  return (
    <>
      <pre>{JSON.stringify({ user, session }, null, 2)}</pre>
      <DashboardComponents />
    </>
  );
}
