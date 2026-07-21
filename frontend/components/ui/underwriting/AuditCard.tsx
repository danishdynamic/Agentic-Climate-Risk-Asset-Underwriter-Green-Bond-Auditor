'use client';

import React, { useState } from 'react';
import { useUnderwriting } from '@/hooks/useUnderwriting';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Play, FileCheck } from 'lucide-react';
import { toast } from 'sonner';

export function AuditCard() {
  const [instruction, setInstruction] = useState('Evaluate climate risk, transition risk, green bond compliance and expected annual loss.');
  const { executeUnderwriting, isLoading } = useUnderwriting();
  const activeAsset = useAppStore((state) => state.activeAsset);

  const handleRunAudit = async () => {
    if (!activeAsset) return toast.warning("Please select a bond first.");
    await executeUnderwriting(activeAsset.isin, instruction);
  };

  const hasAsset = !!activeAsset;

  return (
    <Card className={`rounded-xl border transition-all duration-300 bg-card/60 backdrop-blur-md shadow-2xs ${
      hasAsset 
        ? 'border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.03)]' 
        : 'border-border/40'
    }`}>
      <CardHeader className="border-b border-border/40 pb-3.5 bg-card/40">
        <CardTitle className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2 text-foreground/80 font-mono">
          <FileCheck className={`h-4 w-4 transition-colors ${hasAsset ? 'text-emerald-500' : 'text-muted-foreground'}`} />
          Underwriting Audit
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 p-5 bg-background/5">
        {activeAsset ? (
          <div className="p-3 bg-emerald-500/[0.03] rounded-xl border border-emerald-500/20 text-xs space-y-1 font-mono">
            <p className="text-emerald-600 dark:text-emerald-400 text-[9px] uppercase tracking-wider font-bold">Currently Auditing</p>
            <p className="font-bold text-foreground tracking-tight">{activeAsset.asset_name}</p>
            <p className="text-[10px] text-muted-foreground">{activeAsset.credit_rating} • {activeAsset.bond_type} • {activeAsset.isin}</p>
          </div>
        ) : (
          <div className="p-3 bg-muted/30 border border-border/50 rounded-xl text-center">
            <p className="text-xs text-muted-foreground italic font-mono">No asset selected in ledger.</p>
          </div>
        )}

        <Textarea 
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          className="min-h-[120px] resize-none text-xs rounded-lg border-border/60 bg-background/50 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50 p-3 font-mono leading-relaxed"
        />
        
        <Button 
          onClick={handleRunAudit} 
          disabled={isLoading || !activeAsset} 
          className={`w-full font-mono text-xs uppercase tracking-wider rounded-lg py-5 font-semibold transition-all duration-200 shadow-sm active:scale-[0.99] ${
            hasAsset 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> 
              Running Audit...
            </>
          ) : (
            <>
              <Play className="mr-2 h-3.5 w-3.5 fill-current" /> 
              Run Audit
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}