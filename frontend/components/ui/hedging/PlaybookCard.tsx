'use client';

import { useAppStore } from '@/lib/store';
import { useHedging } from '@/hooks/useHedging'; // Assuming you have this hook
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function PlaybookCard() {
  const hedgingResult = useAppStore((state) => state.hedgingResult);
  const activeAsset = useAppStore((state) => state.activeAsset);
  const isLoading = useAppStore((state) => state.loading.hedging);
  const { calculateHedging } = useHedging();

  return (
    <Card className="rounded-lg border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm uppercase tracking-widest">Hedging Playbook</CardTitle>
        <Button 
          size="sm" 
          onClick={() => activeAsset && calculateHedging(activeAsset.id)}
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
        {!hedgingResult ? (
          <div className="text-center py-8 text-muted-foreground border-dashed border rounded-md">
            <p className="text-xs">No strategy active.</p>
            <p className="text-[10px]">Click generate to analyze.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="uppercase text-[10px] text-muted-foreground mb-2">Recommendation</p>
              <Badge variant="default" className="text-sm px-3 py-1">
                {hedgingResult.recommendation}
              </Badge>
            </div>
            
            <div className="pt-4 border-t">
              <p className="uppercase text-[10px] text-muted-foreground mb-2">Execution Summary</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                The strategy utilizes the <span className="font-semibold text-foreground">{hedgingResult.instrument}</span> 
                instrument with a hedge ratio of <span className="font-semibold text-foreground">{hedgingResult.hedgeRatio}</span>. 
                The total estimated cost for this execution is <span className="font-semibold text-foreground">{hedgingResult.costEstimate}</span>.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}