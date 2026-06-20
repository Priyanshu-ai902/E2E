import { NextResponse } from 'next/server';
import { getCsrfToken } from '@/lib/auth-custom';

export async function GET() {
  const token = await getCsrfToken();
  return NextResponse.json({ csrfToken: token });
}
