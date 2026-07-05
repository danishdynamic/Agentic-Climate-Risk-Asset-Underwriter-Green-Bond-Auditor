'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function Topbar() {
  // Option A: Granular split selectors preventing infinite rendering loops
  const selectedBond = useAppStore((state) => state.selectedBond);
  const sessionId = useAppStore((state) => state.sessionId);
  const auditStatus = useAppStore((state) => state.auditStatus);
  const hedgingStatus = useAppStore((state) => state.hedgingStatus);

  return (
    <header className="h-14 border-b flex items-center px-8 gap-8 bg-background">
      {/* Asset Context */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase text-muted-foreground">Asset</span>
        {selectedBond ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">{selectedBond.asset_name}</span>
            <Badge variant="outline" className="text-[10px]">{selectedBond.credit_rating}</Badge>
            <span className="font-mono text-xs text-muted-foreground">({selectedBond.isin})</span>
          </div>
        ) : (
          <span className="text-xs italic text-muted-foreground">No Bond Selected</span>
        )}
      </div>
      
      <Separator orientation="vertical" className="h-4" />
      
      {/* Session Scope Identity Indicator */}
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        Session: <span className="font-mono">{(sessionId ?? "N/A").slice(0, 8)}</span>
      </div>
      
      <div className="flex-1" />
      
      {/* Workflow Operational Status Indicators */}
      <div className="flex items-center gap-4">
        {/* Underwriting Audit Status Check */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase">Audit</span>
          <Badge className={cn("rounded-none", 
            auditStatus === 'COMPLETED' ? 'bg-emerald-600' : 
            auditStatus === 'RUNNING' ? 'bg-amber-500' : 
            auditStatus === 'FAILED' ? 'bg-red-600' : 'bg-muted-foreground'
          )}>
            {auditStatus ?? "IDLE"}
          </Badge>
        </div>

        {/* Portfolio Hedging Strategy Calculation Status Check */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase">Hedging</span>
          <Badge className={cn("rounded-none", 
            hedgingStatus === 'COMPLETED' ? 'bg-emerald-600' : 
            hedgingStatus === 'FAILED' ? 'bg-red-600' : 'bg-muted-foreground'
          )}>
            {hedgingStatus ?? "IDLE"}
          </Badge>
        </div>
      </div>
    </header>
  );
}