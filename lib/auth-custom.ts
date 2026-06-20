import { db } from './db';
import { users, sessions } from './db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Password validation helper
export function validatePassword(password: string): boolean {
  return password.length >= 5;
}

// Global in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, action: string, limit = 5, durationMs = 15 * 60 * 1000): boolean {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record) {
    rateLimitMap.set(key, { count: 1, resetTime: now + durationMs });
    return true;
  }

  if (now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + durationMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

// CSRF Helpers
export async function getCsrfToken() {
  const cookieStore = await cookies();
  let token = cookieStore.get('kryon_csrf')?.value;
  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
    cookieStore.set('kryon_csrf', token, {
      httpOnly: false, // Accessible by client JS to send in header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }
  return token;
}

export async function verifyCsrf(req: Request): Promise<boolean> {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && new URL(origin).host !== host) {
    return false;
  }

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get('kryon_csrf')?.value;
  const headerToken = req.headers.get('x-csrf-token') || req.headers.get('X-CSRF-Token');

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return false;
  }
  return true;
}

// Session Helpers
export async function createSession(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiration

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    token,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set('kryon_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });

  return token;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('kryon_session')?.value;

  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  cookieStore.delete('kryon_session');
}

export async function getCustomSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kryon_session')?.value;

    if (!token) return null;

    const sessionRecord = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
      with: {
        user: true,
      },
    });

    if (!sessionRecord) return null;

    // Check if session has expired
    if (sessionRecord.expiresAt < new Date()) {
      await db.delete(sessions).where(eq(sessions.token, token));
      cookieStore.delete('kryon_session');
      return null;
    }

    const { user } = sessionRecord;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.githubAvatar,
        emailVerified: user.emailVerified,
        githubConnected: user.githubConnected,
      },
      accessToken: user.githubAccessToken || undefined,
    };
  } catch (error) {
    console.error('Error getting custom session:', error);
    return null;
  }
}
