'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { useHedging } from '@/hooks/useHedging';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';

export function GenerateStrategyCard() {
  // Standardized domain state targeting
  const selectedBond = useAppStore((state) => state.selectedBond);
  const { calculateHedging, isLoading, error } = useHedging();

  const handleGenerateStrategy = async () => {
    if (!selectedBond?.id) return;

    try {
      // Maps exactly to the numerical contract required by your API wrapper
      await calculateHedging(selectedBond.isin);
    } catch {
      // Intentional silent catch: State engine intercepts exceptions via store errors slice
    }
  };

  return (
    <Card className="rounded-lg border border-border/40 bg-background/50 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-bold uppercase tracking-wider">
            Risk Mitigation Engine
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Synthesize AI hedging playbooks and calculate exact derivative sensitivities for the selected asset.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Core Ledger Parameter Breakdown */}
        <div className="flex items-center justify-between rounded-md border bg-muted/30 px-4 py-3 font-mono text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground block text-[10px] uppercase tracking-widest">
              Active Strategy Target
            </span>
            <span className="text-sm font-bold text-foreground tracking-tight">
              {selectedBond?.isin || "NO BOND SELECTED"}
            </span>
          </div>
          <div className="text-right space-y-1">
            <span className="text-muted-foreground block text-[10px] uppercase tracking-widest">
              Internal Identifier
            </span>
            <span className="text-xs font-bold uppercase text-foreground">
              {selectedBond?.id ? `#${selectedBond.id}` : "N/A"}
            </span>
          </div>
        </div>

        {/* Unified Store Error Feedback Node */}
        {error && (
          <Alert variant="destructive" className="rounded-md py-2 px-3 border-destructive/20 bg-destructive/5 text-destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription className="text-xs font-mono uppercase tracking-wide">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Trigger Interface */}
        <div className="space-y-2">
          <Button 
            onClick={handleGenerateStrategy} 
            disabled={!selectedBond?.id || isLoading}
            className="w-full font-mono text-xs uppercase tracking-wider rounded-md font-bold transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating Greeks Playbook...
              </>
            ) : (
              "Generate Hedging Strategy"
            )}
          </Button>

          {/* Institutional Advisory Footer */}
          <p className="text-[10px] leading-relaxed text-muted-foreground/70 font-mono text-center pt-1 uppercase tracking-wide">
          </p>
        </div>
      </CardContent>
    </Card>
  );
}