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

  // Determine if we have an active asset to dynamically adjust border weights
  const hasTarget = !!selectedBond?.id;

  return (
    <Card className={`rounded-xl border transition-all duration-300 bg-card/60 backdrop-blur-md shadow-2xs ${
      hasTarget 
        ? 'border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.03)]' 
        : 'border-border/40'
    }`}>
      <CardHeader className="pb-3.5 border-b border-border/40 bg-card/40">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`h-4 w-4 transition-colors ${hasTarget ? 'text-amber-500' : 'text-muted-foreground'}`} />
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground/80 font-mono">
            Risk Mitigation Engine
          </CardTitle>
        </div>
        <CardDescription className="text-[11px] text-muted-foreground leading-relaxed mt-1">
          Synthesize AI hedging playbooks and calculate exact derivative sensitivities for the selected asset.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 p-5 bg-background/5">
        {/* Core Ledger Parameter Breakdown */}
        <div className={`flex items-center justify-between rounded-xl border px-4 py-3 font-mono text-xs transition-all duration-200 ${
          hasTarget 
            ? 'bg-amber-500/[0.03] border-amber-500/20 shadow-2xs' 
            : 'bg-muted/30 border-border/50'
        }`}>
          <div className="space-y-1">
            <span className={`block text-[9px] uppercase tracking-widest font-semibold ${
              hasTarget ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
            }`}>
              Active Strategy Target
            </span>
            <span className="text-xs font-bold text-foreground tracking-tight">
              {selectedBond?.isin || "NO BOND SELECTED"}
            </span>
          </div>
          <div className="text-right space-y-1">
            <span className="text-muted-foreground block text-[9px] uppercase tracking-widest font-semibold">
              Internal Identifier
            </span>
            <span className={`text-xs font-bold uppercase ${
              hasTarget ? 'text-amber-600 dark:text-amber-400' : 'text-foreground/70'
            }`}>
              {selectedBond?.id ? `#${selectedBond.id}` : "N/A"}
            </span>
          </div>
        </div>

        {/* Unified Store Error Feedback Node */}
        {error && (
          <Alert variant="destructive" className="rounded-xl py-2.5 px-3 border-destructive/20 bg-destructive/5 text-destructive animate-in fade-in duration-200">
            <ShieldAlert className="h-4 w-4 shrink-0" />
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
            className={`w-full font-mono text-xs uppercase tracking-wider rounded-lg py-5 font-semibold transition-all duration-200 shadow-sm active:scale-[0.99] ${
              hasTarget 
                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Calculating Greeks Playbook...
              </>
            ) : (
              "Generate Hedging Strategy"
            )}
          </Button>

          {/* Institutional Advisory Footer */}
          <p className="text-[10px] leading-relaxed text-muted-foreground/70 font-mono text-center pt-1 uppercase tracking-wide">
            {/* Kept intact for spacing layout configurations */}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}