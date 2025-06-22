import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';

import { connectToDatabase } from '@/db';
import Session, { ISession } from '@/db/schema/session';
import User, { IUser } from '@/db/schema/user';

import { getAuthCookie, removeAuthCookie } from './cookies';
import { generateSessionToken, getTokenExpiry } from './jwt';

export type AuthUser = IUser;

export type UserSession = {
  user: AuthUser;
  session: ISession;
};

// Extend NextApiRequest to include user
declare module 'next' {
  interface NextApiRequest {
    user?: AuthUser;
  }
}

export async function createUserSession(user: AuthUser, req?: NextRequest): Promise<string> {
  await connectToDatabase();

  const token = generateSessionToken();
  const expiresAt = getTokenExpiry();

  try {
    await Session.create({
      userId: user._id,
      token,
      expiresAt,
      userAgent: req?.headers.get('user-agent') || undefined,
      ipAddress: req?.headers.get('x-forwarded-for') || undefined,
      isActive: true,
    });

    // Don't set cookie here - let the route handler do it
    return token;
  } catch (error) {
    console.error('Session creation error:', error);
    throw new Error('Failed to create session');
  }
}

export async function getUserFromSession(): Promise<UserSession | null> {
  await connectToDatabase();

  const token = await getAuthCookie();
  if (!token) return null;

  try {
    const session = await Session.findOne({
      token,
    });

    if (!session || !session?.userId) return null;

    const user = await User.findById(session.userId);
    if (!user) {
      // Clean up invalid session
      await Session.findByIdAndDelete(session._id);
      return null;
    }

    return {
      user: user,
      session: session as ISession,
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export async function destroySession(): Promise<void> {
  await connectToDatabase();

  const token = await getAuthCookie();
  if (token) {
    try {
      await Session.findOneAndDelete({ token });
    } catch (error) {
      console.error('Session destruction error:', error);
    }
  }
  await removeAuthCookie();
}

export async function destroyAllUserSessions(userId: string): Promise<void> {
  await connectToDatabase();
  try {
    await Session.deleteUserSessions(userId);
  } catch (error) {
    console.error('Failed to destroy user sessions:', error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function requireAuth(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = await getUserFromSession();
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    req.user = user.user;
    return handler(req, res);
  };
}

export function requireRole(role: 'user' | 'admin' | 'recruiter') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return function (handler: Function) {
    return requireAuth(async (req: NextApiRequest, res: NextApiResponse) => {
      const user = req.user!;
      if (role === 'admin' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      if (role === 'recruiter' && user.role !== 'recruiter') {
        return res.status(403).json({ error: 'Recruiter access required' });
      }
      return handler(req, res);
    });
  };
}

// Helper function to clean up expired sessions (can be called by cron job)
export async function cleanupExpiredSessions(): Promise<number> {
  await connectToDatabase();
  try {
    const result = await Session.cleanupExpiredSessions();
    return result.deletedCount;
  } catch (error) {
    console.error('Session cleanup error:', error);
    return 0;
  }
}

export async function auth() {
  const userSession = await getUserFromSession();
  if (!userSession) {
    return {
      user: null,
      session: null,
      isAuthenticated: false,
      isAdmin: false,
      isRecruiter: false,
      isUser: false,
    };
  }
  return {
    ...userSession,
    isAuthenticated: true,
    isAdmin: userSession.user.role === 'admin',
    isRecruiter: userSession.user.role === 'recruiter',
    isUser: userSession.user.role === 'user',
  };
}
