'use client';

import React from 'react';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { AnalyzeBondCard } from '@/components/ui/analytics/AnalyzeBondCard';
import { RiskAnalytics } from '@/components/ui/analytics/RiskAnalytics';
import { ClimateMetrics } from '@/components/ui/analytics/ClimateMetrics';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* SECTION: Page Title & Context */}
      <section aria-label="Page Header">
        <PageHeader 
          title="Bond Analytics" 
          subtitle="Climate Risk Metrics & Transition Pathway Projections" 
        />
      </section>

      {/* SECTION: Operational Strategy Executor */}
      <section aria-label="Analysis Execution Engine" className="max-w-xl">
        <AnalyzeBondCard />
      </section>

      {/* SECTION: Analytics Engine Matrices */}
      <section 
        aria-label="Quantitative Analytics Framework" 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
      >
        {/* Quantitative Portfolio Exposure & Value-at-Risk Engine */}
        <div className="w-full">
          <RiskAnalytics />
        </div>
        
        {/* Physical Climate Modeling & Scenario Projection Arrays */}
        <div className="w-full">
          <ClimateMetrics />
        </div>
      </section>
    </div>
  );
}