import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protected pages & api paths
  const isDashboard = pathname.startsWith('/dashboard');
  const isOnboarding = pathname === '/connect-github';
  const isApiProtected = pathname.startsWith('/api/analyze') || 
                          pathname.startsWith('/api/tests') || 
                          (pathname.startsWith('/api/github') && 
                           !pathname.startsWith('/api/github/callback') && 
                           !pathname.startsWith('/api/github/connect'));

  if (!isDashboard && !isOnboarding && !isApiProtected) {
    return NextResponse.next();
  }

  const token = req.cookies.get('kryon_session')?.value;

  if (!token) {
    if (isApiProtected) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized: Not logged in' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not configured");
    }
    const sql = neon(databaseUrl);
    
    // Perform raw SQL join query optimized for speed
    const results = await sql`
      SELECT s.expires_at, u.email_verified, u.github_connected 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.token = ${token} 
      LIMIT 1
    `;

    if (!results || results.length === 0) {
      if (isApiProtected) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized: Invalid session' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('kryon_session');
      return response;
    }

    const session = results[0];
    const expiresAt = new Date(session.expires_at);

    if (expiresAt < new Date()) {
      if (isApiProtected) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized: Session expired' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('kryon_session');
      return response;
    }

    const isGithubConnected = session.github_connected;

    // Rule: Logged in but GitHub not connected -> connect GitHub
    if (!isGithubConnected) {
      if (pathname === '/connect-github') {
        return NextResponse.next();
      }
      if (isApiProtected) {
        return new NextResponse(JSON.stringify({ error: 'Forbidden: GitHub not connected' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return NextResponse.redirect(new URL('/connect-github', req.url));
    }

    // Rule: Logged in + GitHub connected -> dashboard
    // If they try to go to onboarding pages, send them to dashboard
    if (pathname === '/connect-github') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware database check failed:', error);
    // Return 500 error for API requests
    if (isApiProtected) {
      return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/connect-github', '/api/analyze/:path*', '/api/tests/:path*', '/api/github/:path*'],
};
