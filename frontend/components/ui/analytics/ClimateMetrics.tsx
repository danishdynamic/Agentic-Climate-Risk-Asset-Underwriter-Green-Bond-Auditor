'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity } from 'lucide-react';

export function ClimateMetrics() {
  const analysis = useAppStore((state) => state.bondAnalysis);

  if (!analysis) {
    return (
      <Card className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-md p-6 text-center text-muted-foreground min-h-[220px] flex items-center justify-center">
        <p className="text-xs font-mono">Awaiting metric evaluation matrix stream...</p>
      </Card>
    );
  }

  const metrics = [
    { label: 'Duration', value: analysis.marketMetrics.duration },
    { label: 'Yield Rate', value: analysis.marketMetrics.yieldRate },
    { label: 'Volatility', value: analysis.marketMetrics.volatility },
  ];

  return (
    <Card className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-md shadow-2xs flex flex-col h-full overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-3.5 bg-card/40">
        <CardTitle className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2 text-foreground/80 font-mono">
          <Activity className="h-4 w-4 text-teal-500" />
          Systemic Risk Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-5 flex-1 bg-background/5">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
              <span>{m.label}</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold">{m.value.toFixed(2)}</span>
            </div>
            
            {/* Styled dynamic progress bar configuration using clean contextual tints */}
            <div className="relative w-full bg-teal-500/10 dark:bg-teal-950/30 rounded-full overflow-hidden h-1.5 border border-teal-500/5">
              <Progress 
                value={Math.min(m.value * 10, 100)} 
                className="h-full bg-teal-500 dark:bg-teal-400 transition-all duration-300" 
              />
            </div>
          </div>
        ))}
        
        <div className="mt-4 pt-3 border-t border-border/30 text-[9px] font-mono text-muted-foreground/80 bg-teal-500/[0.02] border border-teal-500/10 rounded-lg p-2.5 text-center">
          Note: Climate-specific vectors will be enabled upon backend schema update.
        </div>
      </CardContent>
    </Card>
  );
}