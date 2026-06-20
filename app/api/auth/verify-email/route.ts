import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.verificationToken, token),
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
    }

    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return NextResponse.json({ error: 'Verification token has expired. Please request a new one.' }, { status: 400 });
    }

    // Mark email as verified and clear token fields
    await db.update(users).set({
      emailVerified: true,
      verificationToken: null,
      verificationExpires: null,
      updatedAt: new Date(),
    }).where(eq(users.id, user.id));

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully!' 
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
