'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { useBondAnalysis } from '@/hooks/useBondAnalysis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShieldAlert, Cpu } from 'lucide-react';

export function AnalyzeBondCard() {
  const selectedBond = useAppStore((state) => state.selectedBond);
  const { analyzeBond, isLoading, error } = useBondAnalysis();

  const handleRunAnalysis = async () => {
    if (!selectedBond?.isin) return;
    
    try {
      await analyzeBond(selectedBond.isin, selectedBond.credit_rating || 'BBB');
    } catch {
      // Intentional silent catch
    }
  };

  const hasTarget = !!selectedBond?.isin;

  return (
    <Card className={`rounded-xl border transition-all duration-300 bg-card/60 backdrop-blur-md shadow-2xs ${
      hasTarget 
        ? 'border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.03)]' 
        : 'border-border/40'
    }`}>
      <CardHeader className="pb-3.5 border-b border-border/40 bg-card/40">
        <div className="flex items-center gap-2">
          <Cpu className={`h-4 w-4 transition-colors ${hasTarget ? 'text-indigo-500' : 'text-muted-foreground'}`} />
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground/80 font-mono">
            Climate Risk Evaluation Engine
          </CardTitle>
        </div>
        <CardDescription className="text-[11px] text-muted-foreground leading-relaxed mt-1">
          Trigger quantitative physical & transition exposure modeling on the currently selected asset.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 p-5 bg-background/5">
        {/* Core Ledger Parameter Breakdown */}
        <div className={`flex items-center justify-between rounded-xl border px-4 py-3 font-mono text-xs transition-all duration-200 ${
          hasTarget 
            ? 'bg-indigo-500/[0.03] border-indigo-500/20 shadow-2xs' 
            : 'bg-muted/30 border-border/50'
        }`}>
          <div className="space-y-1">
            <span className={`block text-[9px] uppercase tracking-widest font-semibold ${
              hasTarget ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'
            }`}>
              Selected Bond Target
            </span>
            <span className="text-xs font-bold text-foreground tracking-tight">
              {selectedBond?.isin || "NO BOND SELECTED"}
            </span>
          </div>
          <div className="text-right space-y-1">
            <span className="text-muted-foreground block text-[9px] uppercase tracking-widest font-semibold">
              Credit Grade
            </span>
            <span className={`text-xs font-bold uppercase ${
              hasTarget ? 'text-indigo-600 dark:text-indigo-400' : 'text-foreground/70'
            }`}>
              {selectedBond?.credit_rating || "N/A"}
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

        {/* Clean Operational Trigger */}
        <Button 
          onClick={handleRunAnalysis} 
          disabled={!selectedBond?.isin || isLoading}
          className={`w-full font-mono text-xs uppercase tracking-wider rounded-lg py-5 font-semibold transition-all duration-200 shadow-sm active:scale-[0.99] ${
            hasTarget 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Computing Risk Vectors...
            </>
          ) : (
            "Run Risk Analysis"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}