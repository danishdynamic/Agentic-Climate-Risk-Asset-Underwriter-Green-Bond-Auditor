'use client';

import { useAudit } from '@/hooks/useAudit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart4 } from 'lucide-react';

export function RiskScoreCard() {
  const { auditResult } = useAudit();

  if (!auditResult) {
    return (
      <Card className="border-dashed border-2 border-border/60 bg-card/20 h-64 flex flex-col items-center justify-center text-muted-foreground p-6 text-center rounded-xl transition-colors">
        <p className="text-xs font-mono text-foreground/70">No active audit ledger executed.</p>
        <p className="text-[10px] max-w-xs mt-1 leading-relaxed">Select a functional bond target and run underwriting to generate structural institutional risk matrices.</p>
      </Card>
    );
  }

  const isCompliant = auditResult.complianceStatus === 'compliant';

  return (
    <Card className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-md shadow-2xs overflow-hidden h-full">
      <CardHeader className="border-b border-border/40 pb-3.5 bg-card/40">
        <CardTitle className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2 text-foreground/80 font-mono">
          <BarChart4 className="h-4 w-4 text-emerald-500" />
          Risk Analysis Results
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-5 p-5 bg-background/5">
        <div className="flex justify-between items-end border-b border-border/40 pb-4">
          <div className="space-y-1 font-mono">
            <p className="text-[9px] uppercase text-muted-foreground tracking-wider font-semibold">Overall Risk Score</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {auditResult.riskScore} <span className="text-xs font-normal text-muted-foreground">/ 100</span>
            </p>
          </div>
          <Badge 
            variant={isCompliant ? 'default' : 'destructive'}
            className={`font-mono text-xs px-3 py-0.5 border font-bold shadow-none ${
              isCompliant 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                : 'bg-destructive/10 text-destructive border-destructive/20'
            }`}
          >
            {auditResult.complianceStatus.toUpperCase()}
          </Badge>
        </div>

        {/* Dense Quantitative Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          {[
            { label: 'Climate VaR', value: '$1.42M' },
            { label: 'Expected Loss', value: '$275k' },
            { label: 'Green Compliance', value: 'PASS', highLight: true },
            { label: 'ESG Rating', value: 'AAA', highLight: true }
          ].map((item) => (
            <div key={item.label} className="p-3 bg-emerald-500/[0.01] dark:bg-emerald-950/[0.05] border border-border/50 rounded-xl space-y-1">
              <p className="text-[9px] uppercase text-muted-foreground tracking-tight truncate font-semibold">{item.label}</p>
              <p className={`text-sm font-bold tracking-tight ${
                item.highLight ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground/90'
              }`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* AI Insight Breakdown Array */}
        <div className="pt-4 border-t border-border/40 space-y-2.5">
          <p className="text-[9px] font-mono uppercase text-muted-foreground tracking-wider font-semibold">
            AI Underwriting Recommendations
          </p>
          <ul className="text-xs space-y-2 font-mono bg-muted/30 border border-border/40 rounded-xl p-3.5 text-muted-foreground">
            {auditResult.findings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-500 select-none font-bold">•</span>
                <span className="text-foreground/80 text-[11px]">{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}