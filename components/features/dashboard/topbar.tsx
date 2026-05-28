'use client';

import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Topbar() {
  return (
    <div className="h-16 border-b border-slate-700/50 glass-hover flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search PRs..."
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors text-slate-400 hover:text-cyan-400">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
