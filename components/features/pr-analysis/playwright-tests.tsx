'use client';

import { useState, useEffect } from 'react';
import { type PlaywrightTest } from '@/lib/ai/schemas';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  FileCode, 
  Copy, 
  Download, 
  Check, 
  Sparkles,
  PlayCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface PlaywrightTestsProps {
  analysisRunId: number | undefined;
  tests: PlaywrightTest[];
  loading?: boolean;
}

export function PlaywrightTests({ analysisRunId, tests, loading }: PlaywrightTestsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadTest = (test: PlaywrightTest) => {
    const blob = new Blob([test.code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${test.title.toLowerCase().replace(/\s+/g, '-')}.spec.ts`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloading test file");
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-in fade-in duration-700">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-lg bg-slate-800" />
          <Skeleton className="h-6 w-64 bg-slate-800" />
        </div>
        <Skeleton className="h-48 rounded-2xl bg-slate-800/30 border border-white/5" />
      </div>
    );
  }

  if (tests.length === 0) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <PlayCircle className="w-4 h-4 text-orange-400" />
          </div>
          Generated Playwright Tests
        </h2>
        <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 px-3 py-1">
          <Sparkles className="w-3 h-3 mr-1.5" />
          Ready to Run
        </Badge>
      </div>

      <div className="space-y-6">
        {tests.map((test, idx) => (
          <div key={idx} className="kryon-card rounded-lg border border-white/5 overflow-hidden flex flex-col">
            <div className="bg-white/[0.03] border-b border-white/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCode className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-200">{test.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-[10px] text-slate-400 hover:text-white hover:bg-white/10"
                  onClick={() => copyToClipboard(test.code, idx)}
                >
                  {copiedIndex === idx ? <Check className="w-3 h-3 mr-1.5" /> : <Copy className="w-3 h-3 mr-1.5" />}
                  {copiedIndex === idx ? 'Copied' : 'Copy Code'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-[10px] text-slate-400 hover:text-white hover:bg-white/10"
                  onClick={() => downloadTest(test)}
                >
                  <Download className="w-3 h-3 mr-1.5" />
                  Download .ts
                </Button>
              </div>
            </div>
            <div className="p-0 bg-[#0d1117] overflow-x-auto custom-scrollbar">
              <pre className="p-6 text-[13px] font-mono leading-relaxed text-slate-300 whitespace-pre">
                <code>{test.code}</code>
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
