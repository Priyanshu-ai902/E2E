'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/features/dashboard/sidebar';
import { Topbar } from '@/components/features/dashboard/topbar';
import { DashboardProvider } from '@/components/features/dashboard/dashboard-context';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { createContext, useContext } from 'react';

const AIContext = createContext<ReturnType<typeof useAIAnalysis> | null>(null);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within AIProvider');
  return context;
};

function DashboardShell({ children }: { children: React.ReactNode }) {
  const ai = useAI();

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar
          onStartAnalysis={(owner, repo, number, sha) => {
            ai.startAnalysis(owner, repo, number, sha);
          }}
        />
        <main className="flex-1 overflow-hidden flex flex-col min-h-0">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const ai = useAIAnalysis();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <AIContext.Provider value={ai}>
      <DashboardProvider>
        <DashboardShell>{children}</DashboardShell>
      </DashboardProvider>
    </AIContext.Provider>
  );
}
