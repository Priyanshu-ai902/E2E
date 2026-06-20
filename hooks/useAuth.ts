'use client';

import { useAuthContext } from '@/components/providers/auth-provider';

export function useAuth() {
  const { user, isLoading, isAuthenticated, login, logout, refreshSession } = useAuthContext();

  return { 
    user, 
    isLoading, 
    login, 
    logout,
    isAuthenticated,
    refreshSession,
    status: isLoading ? 'loading' : isAuthenticated ? 'authenticated' : 'unauthenticated'
  };
}
