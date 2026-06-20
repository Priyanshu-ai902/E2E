import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { validatePassword, checkRateLimit, verifyCsrf, createSession } from '@/lib/auth-custom';

export async function POST(req: Request) {
  // CSRF check
  const isCsrfValid = await verifyCsrf(req);
  if (!isCsrfValid) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  // Rate Limiting
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  if (!checkRateLimit(ip, 'register')) {
    return NextResponse.json({ error: 'Too many registration requests. Please try again in 15 minutes.' }, { status: 429 });
  }

  try {
    const { name, email, password, confirmPassword } = await req.json();

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // Password strength check
    if (!validatePassword(password)) {
      return NextResponse.json({ 
        error: 'Password must be at least 5 characters.' 
      }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    // Hash password with bcrypt cost factor 12
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user (emailVerified defaults to true since email verification is disabled)
    const [newUser] = await db.insert(users).values({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      emailVerified: true,
      githubConnected: false,
    }).returning();

    // Create session (logs user in automatically)
    await createSession(newUser.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
