'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin">
          <div className="h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
