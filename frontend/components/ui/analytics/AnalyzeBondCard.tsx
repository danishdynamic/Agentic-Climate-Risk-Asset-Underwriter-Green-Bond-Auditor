'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { useBondAnalysis } from '@/hooks/useBondAnalysis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShieldAlert, Cpu } from 'lucide-react';

export function AnalyzeBondCard() {
  // Standardized state targeting
  const selectedBond = useAppStore((state) => state.selectedBond);
  const { analyzeBond, isLoading, error } = useBondAnalysis();

  const handleRunAnalysis = async () => {
    if (!selectedBond?.isin) return;
    
    try {
      // Aligned with the database creditRating entity and hook contract
      await analyzeBond(selectedBond.isin, selectedBond.credit_rating || 'BBB');
    } catch {
      // Intentional catch block: exceptions are intercepted and managed via store slices inside the hook
    }
  };

  return (
    <Card className="rounded-lg border border-border/40 bg-background/50 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-bold uppercase tracking-wider">
            Climate Risk Evaluation Engine
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Trigger quantitative physical & transition exposure modeling on the currently selected asset.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Core Ledger Parameter Breakdown */}
        <div className="flex items-center justify-between rounded-md border bg-muted/30 px-4 py-3 font-mono text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground block text-[10px] uppercase tracking-widest">
              Selected Bond Target
            </span>
            <span className="text-sm font-bold text-foreground tracking-tight">
              {selectedBond?.isin || "NO BOND SELECTED"}
            </span>
          </div>
          <div className="text-right space-y-1">
            <span className="text-muted-foreground block text-[10px] uppercase tracking-widest">
              Credit Grade
            </span>
            <span className="text-xs font-bold uppercase text-foreground">
              {selectedBond?.credit_rating || "N/A"}
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

        {/* Clean Operational Trigger */}
        <Button 
          onClick={handleRunAnalysis} 
          disabled={!selectedBond?.isin || isLoading}
          className="w-full font-mono text-xs uppercase tracking-wider rounded-md font-bold transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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