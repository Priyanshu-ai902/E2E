import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  const newUrl = new URL('/api/auth/callback/github', req.url);
  if (code) newUrl.searchParams.set('code', code);
  if (state) newUrl.searchParams.set('state', state);
  
  console.log('[OAUTH] Legacy /api/github/callback route reached, redirecting to /api/auth/callback/github');
  return NextResponse.redirect(newUrl);
}
