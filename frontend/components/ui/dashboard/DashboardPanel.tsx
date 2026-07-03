'use client';

import React from 'react';
import { AppFeedback } from '@/components/common/AppFeedback';
import { DataCard } from '@/components/common/DataCard';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/useDashboard';
import { useHealth } from '@/hooks/useHealth';
import { useAssets } from '@/hooks/useAssets';

export function DashboardPanel() {
  const { health, isLoading: healthLoading } = useHealth();
  const { assets, isLoading: assetsLoading } = useAssets();
  const { stats, fetchDashboardData } = useDashboard();

  // Combine loading states
  const isLoading = healthLoading || assetsLoading;

  return (
    <AppFeedback isLoading={isLoading} error={null} isEmpty={assets.length === 0}>
      <div className="flex flex-col gap-6">
        
        {/* System Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DataCard label="System Status" value={health?.status === 'healthy' ? 'ONLINE' : 'ERROR'} />
          <DataCard label="Total Bonds" value={assets.length} />
          <DataCard label="Active Alerts" value="0" />
          <DataCard label="Risk Rating" value="LOW" />
        </div>

        {/* Recent Assets & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 border bg-card p-4 rounded-none">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Recent Assets</h3>
            {/* Minimal Asset List */}
            <div className="space-y-2">
              {assets.slice(0, 5).map((asset) => (
                <div key={asset.id} className="flex justify-between text-sm py-2 border-b last:border-0">
                  <span className="font-mono">{asset.isin}</span>
                  <span className="text-muted-foreground">{asset.asset_name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border bg-card p-4 rounded-none flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2">Quick Actions</h3>
            <Button variant="outline" className="justify-start rounded-none">Run Audit</Button>
            <Button variant="outline" className="justify-start rounded-none">Execute Hedge</Button>
            <Button variant="outline" className="justify-start rounded-none">New Underwrite</Button>
          </div>
        </div>
      </div>
    </AppFeedback>
  );
}