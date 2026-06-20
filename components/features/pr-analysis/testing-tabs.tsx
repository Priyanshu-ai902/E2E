'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AITestStrategy } from './ai-test-strategy';
import { CoveragePredictionCard } from './coverage-prediction';
import { TestPrioritizationQueue } from './test-prioritization-queue';
import { PlaywrightTests } from './playwright-tests';
import { type TestPlan, type CoveragePrediction, type PlaywrightTest } from '@/lib/ai/schemas';
import { type RankedQueue } from '@/lib/ai/prioritizer';
import { motion } from 'framer-motion';
import { Beaker, Target, ListOrdered, FileCode } from 'lucide-react';

interface TestingTabsProps {
  analysisRunId: number | undefined;
  testPlan: TestPlan | null;
  prediction: CoveragePrediction | null;
  queue: RankedQueue;
  playwrightTests: PlaywrightTest[];
  loading: {
    strategy: boolean;
    coverage: boolean;
    prioritize: boolean;
    playwright: boolean;
  };
}

export function TestingTabs({
  analysisRunId,
  testPlan,
  prediction,
  queue,
  playwrightTests,
  loading,
}: TestingTabsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-sm font-semibold text-white">Testing Intelligence</h2>
        <p className="text-xs text-white/40 mt-0.5">Strategic test planning powered by risk analysis</p>
      </div>

      <Tabs defaultValue="strategy" className="w-full">
        <TabsList className="w-full justify-start bg-white/[0.03] border border-white/[0.06] p-1 h-auto flex-wrap gap-1">
          <TabsTrigger
            value="strategy"
            className="text-xs data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 gap-1.5"
          >
            <Beaker className="w-3.5 h-3.5" />
            Strategic Risks
          </TabsTrigger>
          <TabsTrigger
            value="coverage"
            className="text-xs data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 gap-1.5"
          >
            <Target className="w-3.5 h-3.5" />
            Coverage
          </TabsTrigger>
          <TabsTrigger
            value="queue"
            className="text-xs data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 gap-1.5"
          >
            <ListOrdered className="w-3.5 h-3.5" />
            Prioritization
          </TabsTrigger>
          <TabsTrigger
            value="playwright"
            className="text-xs data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 gap-1.5"
          >
            <FileCode className="w-3.5 h-3.5" />
            Playwright
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategy" className="mt-4 focus-visible:outline-none">
          {loading.strategy ? (
            <TabLoading label="Generating test strategy..." />
          ) : testPlan ? (
            <AITestStrategy analysisRunId={analysisRunId} testPlan={testPlan} />
          ) : (
            <TabEmpty label="Test strategy will appear after analysis." />
          )}
        </TabsContent>

        <TabsContent value="coverage" className="mt-4 focus-visible:outline-none">
          <CoveragePredictionCard
            analysisRunId={analysisRunId}
            prediction={prediction}
            loading={loading.coverage}
          />
          {!loading.coverage && !prediction && <TabEmpty label="Coverage prediction pending." />}
        </TabsContent>

        <TabsContent value="queue" className="mt-4 focus-visible:outline-none">
          {loading.prioritize ? (
            <TabLoading label="Building prioritization queue..." />
          ) : queue.length > 0 ? (
            <TestPrioritizationQueue analysisRunId={analysisRunId} queue={queue} loading={false} />
          ) : (
            <TabEmpty label="Prioritization queue will appear after test strategy." />
          )}
        </TabsContent>

        <TabsContent value="playwright" className="mt-4 focus-visible:outline-none">
          <PlaywrightTests
            analysisRunId={analysisRunId}
            tests={playwrightTests}
            loading={loading.playwright}
          />
          {!loading.playwright && playwrightTests.length === 0 && (
            <TabEmpty label="Playwright specs will generate after test planning." />
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function TabLoading({ label }: { label: string }) {
  return (
    <div className="kryon-card rounded-lg p-8 flex flex-col items-center gap-3">
      <div className="w-5 h-5 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}

function TabEmpty({ label }: { label: string }) {
  return (
    <div className="kryon-card rounded-lg p-8 text-center">
      <p className="text-xs text-white/30">{label}</p>
    </div>
  );
}
