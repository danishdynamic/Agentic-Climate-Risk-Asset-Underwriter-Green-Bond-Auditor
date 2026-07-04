'use client';

import React, { useState } from 'react';
import { useUnderwriting } from '@/hooks/useUnderwriting';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';

export function AuditCard() {
  const [instruction, setInstruction] = useState('Evaluate climate risk, transition risk, green bond compliance and expected annual loss.');
  const { executeUnderwriting, isLoading } = useUnderwriting();
  const activeAsset = useAppStore((state) => state.activeAsset);

  const handleRunAudit = async () => {
    if (!activeAsset) return toast.warning("Please select a bond first.");
    await executeUnderwriting(activeAsset.isin, instruction);
  };

  return (
    <Card className="rounded-lg border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-widest">Underwriting Audit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeAsset ? (
          <div className="p-3 bg-muted/20 rounded-md border text-xs space-y-1">
            <p className="text-muted-foreground uppercase">Currently Auditing</p>
            <p className="font-bold">{activeAsset.asset_name}</p>
            <p className="text-[10px]">{activeAsset.credit_rating} • {activeAsset.bond_type} • {activeAsset.isin}</p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No asset selected.</p>
        )}

        <Textarea 
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          className="min-h-[120px] resize-none text-xs"
        />
        <Button onClick={handleRunAudit} disabled={isLoading || !activeAsset} className="w-full">
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running Audit...</> : <><Play className="mr-2 h-4 w-4" /> Run Audit</>}
        </Button>
      </CardContent>
    </Card>
  );
}