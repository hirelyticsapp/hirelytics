import crypto from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { env } from '@/env';

const JWT_SECRET = env.JWT_SECRET;
const TOKEN_EXPIRY = '7d';

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getTokenExpiry(): Date {
  const days = parseInt(TOKEN_EXPIRY.replace('d', '')) || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
