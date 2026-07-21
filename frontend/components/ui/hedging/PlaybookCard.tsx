'use client';

import { useAppStore } from '@/lib/store';
import { useHedging } from '@/hooks/useHedging';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert } from 'lucide-react';

export function PlaybookCard() {
  const hedgingResult = useAppStore((state) => state.hedgingResult);
  const activeAsset = useAppStore((state) => state.activeAsset);
  const isLoading = useAppStore((state) => state.loading.hedging);
  const { calculateHedging } = useHedging();

  const playbook = hedgingResult?.playbook;

  return (
    <Card className="rounded-xl border-0 shadow-none bg-transparent flex flex-col h-full min-h-[350px]">
      
      {/* Structural Header Wrapper with absolute/relative safety layers */}
      <CardHeader className="relative z-20 flex flex-row items-center justify-between pb-3.5 border-b border-border/40 shrink-0 bg-card/40 w-full gap-2">
        <CardTitle className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2 text-foreground/80 whitespace-nowrap">
          <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
          Hedging Playbook
        </CardTitle>
        
        <Button 
          size="sm" 
          onClick={() => activeAsset && calculateHedging(activeAsset.isin)}
          disabled={isLoading || !activeAsset}
          className="relative z-30 h-8 text-[10px] font-mono uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white disabled:bg-muted shrink-0 shadow-xs cursor-pointer active:scale-95 transition-transform"
        >
          {isLoading ? (
            <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> Generating...</>
          ) : (
            "Generate Strategy"
          )}
        </Button>
      </CardHeader>
      
      {/* Scrollable Content Engine Area */}
      <CardContent className="flex-1 p-5 space-y-4 overflow-y-auto bg-background/5 min-h-0">
        {!playbook ? (
          <div className="text-center py-12 text-muted-foreground border-dashed border border-amber-500/20 bg-amber-500/[0.01] rounded-xl flex flex-col items-center justify-center h-full min-h-[180px]">
            <p className="text-xs font-medium text-foreground/70">No active mitigation matrix.</p>
            <p className="text-[10px] mt-0.5">Initialize simulation pipeline execution.</p>
          </div>
        ) : (
          <div className="space-y-4 h-full flex flex-col justify-between">
            {/* Risk Assessment Summary Section */}
            <div className="bg-amber-500/[0.03] border border-amber-500/15 rounded-xl p-3.5 shadow-2xs">
              <p className="uppercase font-mono text-[9px] font-bold text-amber-600 dark:text-amber-400 mb-1.5 tracking-wider">
                Risk Assessment Matrix
              </p>
              <p className="text-xs leading-relaxed text-foreground/90 font-normal">
                {playbook.risk_assessment_summary}
              </p>
            </div>
            
            {/* Actionable Hedging Directives List */}
            {playbook.hedging_actionable_directives?.length > 0 && (
              <div className="pt-3 border-t border-border/40 flex-1">
                <p className="uppercase font-mono text-[9px] font-bold text-muted-foreground mb-2 tracking-wider">
                  Actionable Directives
                </p>
                <ul className="space-y-2">
                  {playbook.hedging_actionable_directives.map((item, index) => (
                    <li key={index} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                      <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Recommended Credit Default Swap (CDS) Buffer Section */}
            <div className="pt-3 border-t border-border/40 shrink-0 flex items-center justify-between bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 mt-2">
              <p className="text-[9px] font-mono uppercase text-amber-700 dark:text-amber-400 font-semibold tracking-wider">
                Recommended CDS Buffer
              </p>
              <p className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">
                {playbook.recommended_credit_default_swap_bps_buffer} bps
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}