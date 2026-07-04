'use client';

import React, { useMemo } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'; // Ensure you have this shadcn component
import { FileText, AlertTriangle, ListChecks } from 'lucide-react';

export function DashboardStats() {
  const { stats, isLoading } = useDashboard();

  const metrics = useMemo(() => [
    { label: 'Total Assets', value: stats?.totalAssets || 0, icon: FileText, sub: 'Indexed' },
    { label: 'System Health', value: stats?.isSystemHealthy ? '🟢 Good' : '🔴 Warning', icon: AlertTriangle, sub: 'Status' },
    { label: 'Pending Tasks', value: (stats as any)?.pendingTasks || 0, icon: ListChecks, sub: 'In Queue' },
  ], [stats]);

  // Loading State: Render skeletons instead of empty cards
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 rounded-lg border-0">
            <Skeleton className="h-5 w-5 mb-3" />
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map(({ label, value, icon: Icon, sub }) => (
        <Card key={label} className="p-6 rounded-lg transition-all hover:shadow-md cursor-pointer border-0">
          <Icon className="h-5 w-5 text-primary mb-3" />
          <p className="text-[10px] uppercase text-muted-foreground tracking-widest">{label}</p>
          <div className="text-3xl font-mono font-bold">{value}</div>
          <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
        </Card>
      ))}
    </div>
  );
}