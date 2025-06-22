import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'auth-token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const, // Changed from 'strict' to 'lax' for better compatibility
  maxAge: 7 * 24 * 60 * 60, // 7 days
  path: '/',
};

export async function setAuthCookie(token: string): Promise<void> {
  const cookie = await cookies();
  cookie.set(COOKIE_NAME, token, COOKIE_OPTIONS);
}

export function setAuthCookieInResponse(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
  return response;
}

export async function removeAuthCookie(): Promise<void> {
  const cookie = await cookies();
  cookie.set(COOKIE_NAME, '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
}

export function removeAuthCookieFromResponse(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
  return response;
}

export async function getAuthCookie(): Promise<string | null> {
  const cookie = await cookies();
  const authCookie = cookie.get(COOKIE_NAME);
  return authCookie ? authCookie.value : null;
}
