import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { checkRateLimit, verifyCsrf, createSession } from '@/lib/auth-custom';

export async function POST(req: Request) {
  // CSRF check
  const isCsrfValid = await verifyCsrf(req);
  if (!isCsrfValid) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  // Rate Limiting
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  if (!checkRateLimit(ip, 'login')) {
    return NextResponse.json({ error: 'Too many login attempts. Please try again in 15 minutes.' }, { status: 429 });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Try to find the user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });

    // Avoid account enumeration by using a generic error message and comparing hash even if user not found
    let isPasswordValid = false;
    if (user && user.passwordHash) {
      isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    } else {
      // Simulate password compare latency to prevent timing attacks
      await bcrypt.compare(password, '$2a$12$UnimportantMockHashForTimingAttackPrevention');
    }

    if (!user || !isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create session and set cookie
    await createSession(user.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.githubAvatar,
        emailVerified: user.emailVerified,
        githubConnected: user.githubConnected,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
