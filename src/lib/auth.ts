import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from './db';
import { Role, SessionUser } from './types';

const SESSION_COOKIE_NAME = 'eduverify_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'eduverify-default-dev-secret-32-chars!!';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours

// In-memory login attempt throttling (IP / email rate-limiting)
interface AttemptRecord {
  count: number;
  lastAttempt: number;
}
const loginAttempts = new Map<string, AttemptRecord>();

export function checkLoginThrottling(identifier: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(identifier);
  if (!record) return { allowed: true };

  // Reset if window of 5 minutes expired
  if (now - record.lastAttempt > 5 * 60 * 1000) {
    loginAttempts.delete(identifier);
    return { allowed: true };
  }

  // Allow up to 10 attempts per 5 minutes for demo convenience
  if (record.count >= 10) {
    const waitSeconds = Math.ceil((5 * 60 * 1000 - (now - record.lastAttempt)) / 1000);
    return { allowed: false, waitSeconds };
  }

  return { allowed: true };
}

export function recordFailedLogin(identifier: string) {
  const now = Date.now();
  const record = loginAttempts.get(identifier) || { count: 0, lastAttempt: now };
  record.count += 1;
  record.lastAttempt = now;
  loginAttempts.set(identifier, record);
}

export function resetLoginAttempts(identifier: string) {
  loginAttempts.delete(identifier);
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

/**
 * Creates HMAC-signed session token containing user payload and expiration
 */
export function createSessionToken(user: SessionUser): string {
  const payload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const json = JSON.stringify(payload);
  const base64 = Buffer.from(json).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64)
    .digest('base64url');

  return `${base64}.${signature}`;
}

/**
 * Verifies HMAC-signed session token
 */
export function verifySessionToken(token: string): SessionUser | null {
  try {
    if (!token || !token.includes('.')) return null;
    const [base64, signature] = token.split('.');
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(base64)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const json = Buffer.from(base64, 'base64url').toString('utf8');
    const data = JSON.parse(json);

    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as Role,
      institutionId: data.institutionId || null,
      institutionName: data.institutionName || null,
      institutionCode: data.institutionCode || null,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Reads and verifies current session user from HTTP-only cookie
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) return null;

  return verifySessionToken(sessionCookie.value);
}

/**
 * Server-side route authorization guard. Throws or returns user.
 */
export async function requireAuth(allowedRoles?: Role[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }

  return user;
}

/**
 * Sets session cookie on response
 */
export async function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Clears session cookie on logout
 */
export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
