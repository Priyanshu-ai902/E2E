import { NextResponse } from 'next/server';
import { getCustomSession } from '@/lib/auth-custom';

export async function GET() {
  const session = await getCustomSession();
  
  // Enforce that a local user session must exist to connect GitHub
  if (!session || !session.user) {
    console.error('[OAUTH] Connect attempted without active local session. Redirecting to login.');
    const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    return NextResponse.redirect(new URL('/login?error=session_required', origin));
  }
  
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/github`;
  const scope = 'read:user user:email repo';
  
  // State holds "connect:<userId>" since GitHub connection is onboarding/linking only
  const state = `connect:${session.user.id}`;
  
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
  
  console.log(`[OAUTH] Generated authorize URL: ${githubUrl}`);
  return NextResponse.redirect(githubUrl);
}
