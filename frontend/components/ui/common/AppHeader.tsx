'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface AppHeaderProps {
  healthStatus: 'healthy' | 'offline' | 'checking';
}

export function AppHeader({ healthStatus }: AppHeaderProps) {
  const activeAsset = useAppStore((state) => state.activeAsset);
  const sessionId = useAppStore((state) => state.threadId); 

  return (
    <header className="w-full border-b bg-background text-foreground">
      <div className="flex h-12 items-center px-4 gap-6">
        
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold tracking-tight uppercase">
            Climate Risk Underwriter
          </span>
        </div>

        <Separator orientation="vertical" className="h-4" />

        <div className="flex items-center gap-3 text-[10px] font-mono tracking-wider">
          <div className="flex items-center gap-2">
            API <Badge variant="outline" className="text-[9px] rounded-none border-muted-foreground/20">
              {healthStatus.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            SESSION <span className="text-muted-foreground">{sessionId?.slice(0, 8) || 'N/A'}</span>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>Selected Bond</span>
          <span className="font-mono font-bold text-foreground px-2 py-0.5 bg-muted rounded-sm border">
            {activeAsset?.isin || "NONE"}
          </span>
        </div>
      </div>
    </header>
  );
}