
import React from 'react';
import { PageHeader } from '@/components/ui/layout/PageHeader'; 
import { DashboardStats } from '@/components/ui/dashboard/DashboardStats';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 1. App Header renders statically via page props */}
      <PageHeader 
        title="Dashboard" 
        subtitle="Portfolio Overview" 
      />
      
      {/* 2. DashboardStats handles its own data hook internally */}
      <DashboardStats />
    </div>
  );
}