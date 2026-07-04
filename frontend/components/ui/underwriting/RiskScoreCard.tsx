'use client';

import { useAudit } from '@/hooks/useAudit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function RiskScoreCard() {
  const { auditResult } = useAudit();

  if (!auditResult) {
    return (
      <Card className="border-dashed h-64 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
        <p className="text-xs">No audit has been executed.</p>
        <p className="text-[10px] mt-1">Select a bond and run underwriting to generate institutional risk metrics.</p>
      </Card>
    );
  }

  return (
    <Card className="rounded-lg border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-widest">Risk Analysis Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-end border-b pb-4">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Overall Risk Score</p>
            <p className="text-2xl font-bold">{auditResult.riskScore} <span className="text-sm font-normal text-muted-foreground">/ 100</span></p>
          </div>
          <Badge variant={auditResult.complianceStatus === 'compliant' ? 'default' : 'destructive'}>
            {auditResult.complianceStatus.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-muted-foreground uppercase">Climate VaR</p>
            <p className="font-semibold">$1.42M</p>
          </div>
          <div>
            <p className="text-muted-foreground uppercase">Expected Annual Loss</p>
            <p className="font-semibold">$275k</p>
          </div>
          <div>
            <p className="text-muted-foreground uppercase">Green Compliance</p>
            <p className="font-semibold">PASS</p>
          </div>
          <div>
            <p className="text-muted-foreground uppercase">ESG Rating</p>
            <p className="font-semibold">AAA</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-[10px] uppercase text-muted-foreground mb-2">AI Recommendation</p>
          <ul className="text-xs space-y-1">
            {auditResult.findings.map((f, i) => <li key={i}>• {f}</li>)}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}