import { auth } from '@/lib/auth/server';

export default async function Home() {
  const { user, session } = await auth();
  return <pre>{JSON.stringify({ user, session }, null, 2)}</pre>;
}
