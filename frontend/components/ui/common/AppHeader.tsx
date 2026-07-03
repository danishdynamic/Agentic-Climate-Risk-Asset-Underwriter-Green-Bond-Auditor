'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils'; 
import { useHealth } from '@/hooks/useHealth'; 

export function AppHeader() {
  const { health, isLoading } = useHealth();
  
  const isHealthy = health?.status === 'healthy';

  return (
    <header className="w-full border-b bg-background text-foreground">
      <div className="flex h-12 items-center px-4 gap-6">
        
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold tracking-tight uppercase">
            Climate Risk Underwriter
          </span>
        </div>

        <Separator orientation="vertical" className="h-4" />

        <div className="flex items-center gap-2">
          {/* Using cn() to conditionally style based on hook state */}
          <Badge variant="outline" className={cn(
            "rounded-none text-[10px] font-mono border-muted-foreground/20",
            isHealthy ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
          )}>
            {isLoading ? "CHECKING..." : isHealthy ? "🟢 HEALTHY" : "🔴 OFFLINE"}
          </Badge>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>Selected Asset</span>
          <span className="font-mono font-bold text-foreground px-2 py-0.5 bg-muted rounded-sm border border-muted-foreground/10">
            US12345
          </span>
        </div>
      </div>
    </header>
  );
}