import React from 'react';
import { PageHeader } from '@/components/ui/layout/PageHeader'; 
import { DashboardStats } from '@/components/ui/dashboard/DashboardStats';
import { AppProfileOverview } from '@/components/ui/dashboard/AppProfileOverview';

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* 1. App Header */}
      <PageHeader 
        title="Terminal Core" 
        subtitle="Climate Risk Portfolio Intelligence Overview" 
      />
      
      {/* 2. Institutional Blueprint Graphic & Description */}
      <AppProfileOverview />
      
      {/* 3. Operational Performance Grid Metrics */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest pl-1">
          System Operational Telemetry
        </div>
        <DashboardStats />
      </div>
    </div>
  );
}