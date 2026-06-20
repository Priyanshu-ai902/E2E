import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { getCustomSession } from '@/lib/auth-custom';

export async function POST(req: Request) {
  try {
    const session = await getCustomSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, Number(session.user.id)),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email is already verified' }, { status: 400 });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.update(users).set({
      verificationToken,
      verificationExpires,
      updatedAt: new Date(),
    }).where(eq(users.id, user.id));

    // Log verification link
    const verificationLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    console.log(`[EMAIL SIMULATION] Resent Verification Email to ${user.email}. Link: ${verificationLink}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Verification email simulated successfully.',
      verificationLink // Return in development so it can be checked
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
