'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';

export function Topbar() {
  // Read state from your Zustand store
  const { selectedAsset, sessionId, auditStatus } = useAppStore((state) => ({
    selectedAsset: state.activeAssetId || "NONE SELECTED",
    sessionId: state.sessionId || "NO SESSION",
    auditStatus: state.auditStatus || "IDLE"
  }));

  return (
    <header className="h-12 border-b flex items-center px-6 gap-6 bg-background">
      <div className="text-[10px] uppercase tracking-widest font-bold">Selected Asset</div>
      <div className="font-mono text-xs bg-muted px-2 py-1 border">{selectedAsset}</div>
      
      <Separator orientation="vertical" className="h-4" />
      
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Session: {sessionId.slice(0, 8)}...</div>
      
      <div className="flex-1" />
      
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase">Audit</span>
        <Badge variant={auditStatus === 'READY' ? 'default' : 'secondary'} className="rounded-none">
          {auditStatus}
        </Badge>
      </div>
    </header>
  );
}