'use client';

import { useAppStore } from '@/lib/store';
import { useHedging } from '@/hooks/useHedging';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function PlaybookCard() {
  const hedgingResult = useAppStore((state) => state.hedgingResult);
  const activeAsset = useAppStore((state) => state.activeAsset);
  const isLoading = useAppStore((state) => state.loading.hedging);
  const { calculateHedging } = useHedging();

  // Extract the playbook dictionary nested inside your hedging results state
  const playbook = hedgingResult?.playbook;

  return (
    <Card className="rounded-lg border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm uppercase tracking-widest">Hedging Playbook</CardTitle>
        <Button 
          size="sm" 
          // Updated to pass asset ISIN to match the revised backend lookup mechanism
          onClick={() => activeAsset && calculateHedging(activeAsset.isin)}
          disabled={isLoading || !activeAsset}
          className="h-8 text-[10px]"
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Generating...</>
          ) : (
            "Generate Strategy"
          )}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!playbook ? (
          <div className="text-center py-8 text-muted-foreground border-dashed border rounded-md">
            <p className="text-xs">No strategy active.</p>
            <p className="text-[10px]">Click generate to analyze.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Risk Assessment Summary Section */}
            <div>
              <p className="uppercase text-[10px] text-muted-foreground mb-2">
                Risk Assessment
              </p>
              <p className="text-xs leading-relaxed text-foreground">
                {playbook.risk_assessment_summary}
              </p>
            </div>
            
            {/* Actionable Hedging Directives List */}
            {playbook.hedging_actionable_directives?.length > 0 && (
              <div className="pt-4 border-t">
                <p className="uppercase text-[10px] text-muted-foreground mb-2">
                  Actionable Directives
                </p>
                <ul className="space-y-2">
                  {playbook.hedging_actionable_directives.map((item, index) => (
                    <li key={index} className="text-xs text-muted-foreground leading-relaxed">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Recommended Credit Default Swap (CDS) Buffer Section */}
            <div className="pt-4 border-t">
              <p className="text-[10px] uppercase text-muted-foreground mb-1">
                Recommended CDS Buffer
              </p>
              <p className="text-lg font-bold font-mono text-foreground">
                {playbook.recommended_credit_default_swap_bps_buffer} bps
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}