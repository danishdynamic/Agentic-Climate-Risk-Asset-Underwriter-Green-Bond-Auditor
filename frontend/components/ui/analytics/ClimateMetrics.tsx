'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { } from '@/lib/types';

export function ClimateMetrics() {
  const analysis = useAppStore((state) => state.bondAnalysis);

  if (!analysis) return null;

  const metrics = [
      {
        label: 'Duration',
        value: analysis.marketMetrics.duration,
      },
      {
        label: 'Yield Rate',
        value: analysis.marketMetrics.yieldRate,
      },
      {
        label: 'Volatility',
        value: analysis.marketMetrics.volatility,
      },
    ];

  return (
    <Card className="rounded-lg border-0 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-widest">Systemic Risk Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="flex justify-between text-[10px] uppercase text-muted-foreground mb-1">
              <span>{m.label}</span>
              <span className="text-foreground font-bold font-mono">{m.value.toFixed(2)}</span>
            </div>
            {/* Normalized progress bar placeholder */}
            <Progress value={Math.min(m.value * 10, 100)} className="h-1.5" />
          </div>
        ))}
        <div className="mt-4 pt-4 border-t text-[10px] text-muted-foreground italic">
          Note: Climate-specific vectors will be enabled upon backend schema update.
        </div>
      </CardContent>
    </Card>
  );
}