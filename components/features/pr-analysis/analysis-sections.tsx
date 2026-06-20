'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, AlertTriangle, Lightbulb, Layers, Radio } from 'lucide-react';
import { type AnalysisResult } from '@/types/github';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AnalysisSectionsProps {
  analysis: AnalysisResult;
  streamedSummary: string;
  isStreaming: boolean;
}

interface SectionConfig {
  id: string;
  title: string;
  icon: typeof Sparkles;
  defaultOpen?: boolean;
}

const sections: SectionConfig[] = [
  { id: 'summary', title: 'Executive Summary', icon: Sparkles, defaultOpen: true },
  { id: 'findings', title: 'Risk Findings', icon: AlertTriangle, defaultOpen: true },
  { id: 'recommendations', title: 'Recommendations', icon: Lightbulb, defaultOpen: false },
  { id: 'systems', title: 'Affected Systems', icon: Layers, defaultOpen: false },
  { id: 'blast', title: 'Blast Radius', icon: Radio, defaultOpen: false },
];

export function AnalysisSections({ analysis, streamedSummary, isStreaming }: AnalysisSectionsProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(sections.map((s) => [s.id, s.defaultOpen ?? false]))
  );

  const toggle = (id: string) => setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const ruleFindings = analysis.ruleFindings || [];
  const risks = analysis.risks || [];
  const recommendations = analysis.recommendations || [];

  return (
    <div className="space-y-2">
      {sections.map((section, idx) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05, duration: 0.25 }}
        >
          <Collapsible open={openSections[section.id]} onOpenChange={() => toggle(section.id)}>
            <div className="kryon-card kryon-card-hover rounded-lg overflow-hidden">
              <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-2.5">
                  <section.icon className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-white">{section.title}</span>
                </div>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-white/30 transition-transform duration-200',
                    openSections[section.id] && 'rotate-180'
                  )}
                />
              </CollapsibleTrigger>
              <AnimatePresence>
                {openSections[section.id] && (
                  <CollapsibleContent forceMount>
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/[0.06]"
                    >
                      <div className="px-4 py-4">
                        {section.id === 'summary' && (
                          <p className="text-sm text-white/70 leading-relaxed">
                            {streamedSummary}
                            {isStreaming && (
                              <span className="inline-block w-1.5 h-4 bg-cyan-400 ml-0.5 animate-pulse" />
                            )}
                          </p>
                        )}

                        {section.id === 'findings' && (
                          <div className="space-y-3">
                            {ruleFindings.length === 0 && risks.length === 0 ? (
                              <p className="text-sm text-white/40">No significant risk findings detected.</p>
                            ) : (
                              <>
                                {ruleFindings.map((f, i) => (
                                  <div key={i} className="p-3 rounded-md bg-white/[0.02] border border-white/[0.06]">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium text-white">{f.title}</span>
                                      <span className="text-[10px] uppercase text-white/40">{f.severity}</span>
                                    </div>
                                    <p className="text-xs text-white/50">{f.description}</p>
                                    {f.file && (
                                      <p className="text-[10px] font-mono text-white/30 mt-2">
                                        {f.file}{f.line ? `:${f.line}` : ''}
                                      </p>
                                    )}
                                  </div>
                                ))}
                                {risks.map((risk, i) => (
                                  <div key={`risk-${i}`} className="p-3 rounded-md bg-red-500/5 border border-red-500/10">
                                    <p className="text-xs text-white/60">{risk}</p>
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        )}

                        {section.id === 'recommendations' && (
                          <ul className="space-y-2">
                            {recommendations.length === 0 ? (
                              <p className="text-sm text-white/40">No recommendations at this time.</p>
                            ) : (
                              recommendations.map((rec, i) => (
                                <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                                  <span className="text-cyan-400 mt-1">•</span>
                                  {rec}
                                </li>
                              ))
                            )}
                          </ul>
                        )}

                        {section.id === 'systems' && (
                          <div className="flex flex-wrap gap-2">
                            {(analysis.affectedModules || []).map((mod) => (
                              <span
                                key={mod}
                                className="text-xs px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/60"
                              >
                                {mod}
                              </span>
                            ))}
                            {analysis.importantChanges?.map((change) => (
                              <span
                                key={change}
                                className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/5 border border-cyan-500/10 text-cyan-400/80"
                              >
                                {change}
                              </span>
                            ))}
                          </div>
                        )}

                        {section.id === 'blast' && (
                          <div className="grid grid-cols-2 gap-2">
                            {(['frontend', 'backend', 'database', 'infrastructure'] as const).map((key) => (
                              <div
                                key={key}
                                className={cn(
                                  'px-3 py-2 rounded-md border text-xs font-medium capitalize',
                                  analysis.blastRadius?.[key]
                                    ? 'border-amber-500/20 bg-amber-500/5 text-amber-400'
                                    : 'border-white/[0.06] text-white/30'
                                )}
                              >
                                {key}
                                {analysis.blastRadius?.[key] ? ' — impacted' : ' — clear'}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </CollapsibleContent>
                )}
              </AnimatePresence>
            </div>
          </Collapsible>
        </motion.div>
      ))}
    </div>
  );
}
