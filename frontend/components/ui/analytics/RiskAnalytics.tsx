'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, TrendingUp } from 'lucide-react';

export function RiskAnalytics() {
  const analysis = useAppStore((state) => state.bondAnalysis);

  if (!analysis) {
    return (
      <Card className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-md p-10 text-center text-muted-foreground min-h-[250px] flex flex-col items-center justify-center">
        <p className="text-xs font-mono text-foreground/70">No analysis vector available.</p>
        <p className="text-[10px] mt-0.5">Execute the risk pipeline visualization to compute models.</p>
      </Card>
    );
  }

  const isBuy = analysis.recommendation?.toLowerCase() === 'buy';

  return (
    <Card className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-md shadow-2xs overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-3.5 bg-card/40">
        <CardTitle className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2 text-foreground/80 font-mono">
          <ShieldCheck className="h-4 w-4 text-indigo-500" />
          Risk Analytics Profile
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 p-5 bg-background/5">
        <div className="flex justify-between items-center bg-muted/40 border border-border/50 rounded-xl px-3.5 py-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Credit Rating Matrix</span>
          <Badge variant="secondary" className="font-mono text-xs px-2.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-none font-bold">
            {analysis.creditRating}
          </Badge>
        </div>

        {/* Quant Metric Value Grid */}
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(analysis.riskMetrics).map(([key, val]) => (
            <div key={key} className="p-2.5 bg-indigo-500/[0.02] dark:bg-indigo-950/10 border border-indigo-500/10 rounded-xl text-center hover:bg-indigo-500/[0.05] transition-colors duration-150">
              <p className="text-[9px] font-mono uppercase text-muted-foreground mb-1 tracking-tight truncate">{key}</p>
              <p className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">{val.toFixed(3)}</p>
            </div>
          ))}
        </div>

        <Separator className="bg-border/40" />

        {/* AI Recommendation State Component */}
        <div className="space-y-2">
          <p className="text-[9px] font-mono uppercase text-muted-foreground tracking-wider flex items-center gap-1.5 font-semibold">
            <TrendingUp className="h-3 w-3 text-teal-500" />
            AI Strategy Recommendation
          </p>
          <div className={`rounded-xl border p-2 text-center transition-all ${
            isBuy 
              ? 'bg-teal-500/5 border-teal-500/20 shadow-2xs' 
              : 'bg-background/50 border-border/50'
          }`}>
            <Badge 
              className={`w-full justify-center capitalize font-mono text-xs font-bold py-1 px-3 border shadow-none ${
                isBuy 
                  ? 'bg-teal-600 dark:bg-teal-500 text-white hover:bg-teal-700 border-transparent' 
                  : 'bg-background text-foreground/80 hover:bg-muted border-border/60'
              }`}
            >
              {analysis.recommendation}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}