'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Layers } from 'lucide-react';

export function Topbar() {
  const selectedBond = useAppStore((state) => state.selectedBond);
  const sessionId = useAppStore((state) => state.sessionId);
  const auditStatus = useAppStore((state) => state.auditStatus);
  const hedgingStatus = useAppStore((state) => state.hedgingStatus);

  return (
    <header className="h-16 border-b border-border/60 flex items-center px-6 gap-6 bg-background/60 backdrop-blur-md select-none">
      
      {/* Asset Context Module */}
      <div className="flex items-center gap-2.5 font-mono text-xs">
        <div className="p-1 rounded-lg bg-muted border text-muted-foreground">
          <Layers className="h-3.5 w-3.5" />
        </div>
        {selectedBond ? (
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground/90 tracking-tight">{selectedBond.asset_name}</span>
            <Badge variant="secondary" className="text-[10px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 px-2 py-0">
              {selectedBond.credit_rating}
            </Badge>
            <span className="text-[11px] text-muted-foreground/70 font-semibold">({selectedBond.isin})</span>
          </div>
        ) : (
          <span className="italic text-muted-foreground/60 tracking-wide text-[11px]">Awaiting Asset Lock...</span>
        )}
      </div>
      
      <Separator orientation="vertical" className="h-4 bg-border/60" />
      
      {/* Session Identity Badge */}
      <div className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground/80 font-semibold">
        Scope ID: <span className="font-bold text-foreground bg-muted border px-1.5 py-0.5 rounded-md">{(sessionId ?? "N/A").slice(0, 8)}</span>
      </div>
      
      <div className="flex-1" />
      
      {/* Pipeline Status Monitors */}
      <div className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-wider">
        
        {/* Underwriting Module Pill */}
        <div className="flex items-center gap-1.5 bg-muted/40 border border-border/60 rounded-xl px-2.5 py-1">
          <span className="text-muted-foreground/80">Audit:</span>
          <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-extrabold font-mono tracking-wide border", 
            auditStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
            auditStatus === 'RUNNING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse' : 
            auditStatus === 'FAILED' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 
            'bg-muted text-muted-foreground/70 border-transparent'
          )}>
            {auditStatus ?? "IDLE"}
          </span>
        </div>

        {/* Hedging Matrix Pill */}
        <div className="flex items-center gap-1.5 bg-muted/40 border border-border/60 rounded-xl px-2.5 py-1">
          <span className="text-muted-foreground/80">Hedge:</span>
          <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-extrabold font-mono tracking-wide border", 
            hedgingStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
            hedgingStatus === 'FAILED' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 
            'bg-muted text-muted-foreground/70 border-transparent'
          )}>
            {hedgingStatus ?? "IDLE"}
          </span>
        </div>
        
      </div>
    </header>
  );
}