import { NextResponse } from 'next/server';
import { destroySession, verifyCsrf } from '@/lib/auth-custom';

export async function POST(req: Request) {
  // CSRF check
  const isCsrfValid = await verifyCsrf(req);
  if (!isCsrfValid) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  try {
    await destroySession();
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
