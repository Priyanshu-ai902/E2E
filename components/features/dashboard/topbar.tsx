'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Kbd } from '@/components/ui/kbd';
import { CommandPalette } from './command-palette';

interface TopbarProps {
  onStartAnalysis?: (owner: string, repo: string, number: number, sha: string) => void;
}

export function Topbar({ onStartAnalysis }: TopbarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <header className="h-12 border-b border-white/[0.06] bg-[#050505] flex items-center px-4 flex-shrink-0">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 flex-1 max-w-lg px-3 py-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-colors text-left"
        >
          <Search className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <span className="text-sm text-white/30 flex-1">Search repositories, PRs, actions...</span>
          <div className="hidden sm:flex items-center gap-1">
            <Kbd className="bg-white/[0.06] border-white/[0.08] text-white/30 text-[10px]">⌘</Kbd>
            <Kbd className="bg-white/[0.06] border-white/[0.08] text-white/30 text-[10px]">K</Kbd>
          </div>
        </button>
      </header>
      <CommandPalette open={open} onOpenChange={setOpen} onStartAnalysis={onStartAnalysis} />
    </>
  );
}
