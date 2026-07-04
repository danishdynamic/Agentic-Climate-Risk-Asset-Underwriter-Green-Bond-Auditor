'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function RiskAnalytics() {
  const analysis = useAppStore((state) => state.bondAnalysis);

  if (!analysis) {
    return (
      <Card className="rounded-lg border-0 shadow-sm p-6 text-center text-muted-foreground">
        <p className="text-xs">No analysis available. Run a bond analysis.</p>
      </Card>
    );
  }

  return (
    <Card className="rounded-lg border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-widest">Risk Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground uppercase">Credit Rating</span>
          <Badge variant="secondary" className="font-mono">{analysis.creditRating}</Badge>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {Object.entries(analysis.riskMetrics).map(([key, val]) => (
            <div key={key} className="p-3 bg-muted/30 rounded-md text-center">
              <p className="text-[9px] uppercase text-muted-foreground mb-1">{key}</p>
              <p className="text-xs font-bold font-mono">{val.toFixed(3)}</p>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-[10px] uppercase text-muted-foreground">AI Strategy Recommendation</p>
          <div className="rounded-md border p-3 bg-card">
            <Badge className="w-full justify-center capitalize" variant={analysis.recommendation === 'buy' ? 'default' : 'outline'}>
              {analysis.recommendation}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}