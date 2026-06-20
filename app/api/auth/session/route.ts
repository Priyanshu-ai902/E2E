import { NextResponse } from 'next/server';
import { getCustomSession } from '@/lib/auth-custom';

export async function GET() {
  const session = await getCustomSession();
  return NextResponse.json(session || { user: null });
}
