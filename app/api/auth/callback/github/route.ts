import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCustomSession } from '@/lib/auth-custom';

export async function GET(req: Request) {
  console.log('[OAUTH] Callback reached');
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Enforce that user must have a valid local session to connect GitHub
  const session = await getCustomSession();
  if (!session || !session.user) {
    console.error('[OAUTH] Callback rejected: No active local session');
    const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    return NextResponse.redirect(new URL('/login?error=session_required', origin));
  }

  const userId = Number(session.user.id);

  if (!code) {
    console.error('[OAUTH] Callback failed: No authorization code received');
    return NextResponse.redirect(new URL('/connect-github?error=no_code', req.url));
  }

  try {
    // 1. Exchange code for GitHub access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    if (!tokenRes.ok) {
      console.error('[OAUTH] Failed to exchange code for GitHub token:', await tokenRes.text());
      return NextResponse.redirect(new URL('/connect-github?error=token_exchange_failed', req.url));
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('[OAUTH] No access token returned from GitHub:', tokenData);
      return NextResponse.redirect(new URL('/connect-github?error=no_access_token', req.url));
    }

    // 2. Fetch GitHub user details
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
        'User-Agent': 'kryon-auth-app',
      },
    });

    if (!userRes.ok) {
      console.error('[OAUTH] Failed to fetch GitHub user:', await userRes.text());
      return NextResponse.redirect(new URL('/connect-github?error=fetch_github_user_failed', req.url));
    }

    const githubUser = await userRes.json();
    const githubId = String(githubUser.id);
    const githubUsername = githubUser.login;
    const githubAvatar = githubUser.avatar_url;

    // 3. Apply Account Linking Rules (Step 3)
    const githubOwner = await db.query.users.findFirst({
      where: eq(users.githubId, githubId),
    });

    if (githubOwner) {
      if (githubOwner.id === userId) {
        // CASE A: github_id belongs to current logged-in user -> update token -> success
        await db.update(users).set({
          githubUsername,
          githubAvatar,
          githubConnected: true,
          githubAccessToken: accessToken,
          updatedAt: new Date(),
        }).where(eq(users.id, userId));
        
        console.log(`[OAUTH] CASE A: Updated GitHub token for current user ID: ${userId}`);
      } else {
        // CASE B: github_id belongs to another user -> reject connection
        console.warn(`[OAUTH] CASE B: Connection rejected. GitHub ID ${githubId} is already connected to another user ID: ${githubOwner.id}`);
        return NextResponse.redirect(new URL('/connect-github?error=already_connected', req.url));
      }
    } else {
      // CASE C: github_id does not exist -> link GitHub to current user -> success
      await db.update(users).set({
        githubId,
        githubUsername,
        githubAvatar,
        githubConnected: true,
        githubAccessToken: accessToken,
        updatedAt: new Date(),
      }).where(eq(users.id, userId));
      
      console.log(`[OAUTH] CASE C: Linked new GitHub ID ${githubId} to current user ID: ${userId}`);
    }

    console.log('[OAUTH] Redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', req.url));
  } catch (error) {
    console.error('[OAUTH] GitHub OAuth Callback error:', error);
    return NextResponse.redirect(new URL('/connect-github?error=oauth_error', req.url));
  }
}
