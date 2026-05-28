'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/features/dashboard/sidebar';
import { Topbar } from '@/components/features/dashboard/topbar';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { createContext, useContext } from 'react';

// Create a simple context to share AI state across the dashboard
const AIContext = createContext<ReturnType<typeof useAIAnalysis> | null>(null);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within AIProvider');
  return context;
};

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
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin relative">
          <div className="h-12 w-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full" />
          <div className="absolute inset-0 h-12 w-12 border-2 border-purple-500/10 border-b-purple-500 rounded-full animate-reverse-spin" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <AIContext.Provider value={ai}>
      <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
        <Sidebar aiSteps={ai.steps as any} />
        <div className="flex flex-col flex-1 relative">
          <Topbar />
          <main className="flex-1 overflow-hidden relative flex flex-col">
             <div className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${
               ai.state === 'analyzing' ? 'opacity-30' : 
               ai.state === 'fetching' ? 'opacity-40' : 'opacity-10'
             }`}>
               <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/20 blur-[120px] rounded-full" />
               <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 blur-[120px] rounded-full" />
             </div>
            {children}
          </main>
        </div>
      </div>
    </AIContext.Provider>
  );
}
