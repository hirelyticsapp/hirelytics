import { cookies } from 'next/headers';

const COOKIE_NAME = 'auth-token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60, // 7 days
  path: '/',
};

export async function setAuthCookie(token: string): Promise<void> {
  const cookie = await cookies();
  cookie.set(COOKIE_NAME, token, COOKIE_OPTIONS);
}

export async function removeAuthCookie(): Promise<void> {
  const cookie = await cookies();
  cookie.set(COOKIE_NAME, '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
}

export async function getAuthCookie(): Promise<string | null> {
  const cookie = await cookies();
  const authCookie = cookie.get(COOKIE_NAME);
  return authCookie ? authCookie.value : null;
}
