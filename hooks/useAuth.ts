'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  const login = async () => {
    await signIn('github', { callbackUrl: '/dashboard' });
  };

  const logout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const user = session?.user ? {
    id: (session.user as any).id || session.user.email || '1',
    email: session.user.email || '',
    name: session.user.name || '',
    image: session.user.image || '',
  } : null;

  return { 
    user, 
    isLoading, 
    login, 
    logout,
    isAuthenticated: !!session,
    status
  };
}
