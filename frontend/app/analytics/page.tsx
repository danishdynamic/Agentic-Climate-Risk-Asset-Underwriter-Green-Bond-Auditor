'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { AnalyzeBondCard } from '@/components/ui/analytics/AnalyzeBondCard';
import { RiskAnalytics } from '@/components/ui/analytics/RiskAnalytics';
import { ClimateMetrics } from '@/components/ui/analytics/ClimateMetrics';
import { Button } from '@/components/ui/button';
import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

export default function AnalyticsPage() {
  const [isFilterBarOpen, setIsFilterBarOpen] = useState(true);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-4 py-2">
      
      {/* SECTION: Page Title & Toolbar Actions */}
      <section aria-label="Page Header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <PageHeader 
          title="Bond Analytics Workspace" 
          subtitle="Climate Risk Metrics & Transition Pathway Projections" 
        />
        
        <Button 
          onClick={() => setIsFilterBarOpen(!isFilterBarOpen)}
          variant="outline"
          className="sm:w-auto w-full font-mono text-xs uppercase tracking-wider shadow-xs"
        >
          <BarChart3 className="mr-2 h-3.5 w-3.5 text-primary" />
          Scope Parameters
          {isFilterBarOpen ? <ChevronUp className="ml-2 h-3 w-3" /> : <ChevronDown className="ml-2 h-3 w-3" />}
        </Button>
      </section>

      {/* SECTION: Collapsible Target Selection Toolbar */}
      {isFilterBarOpen && (
        <section 
          aria-label="Analysis Execution Engine" 
          className="bg-card/40 border p-4 rounded-xl shadow-xs animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2.5">
            Target Execution Control Panel
          </div>
          <div className="max-w-2xl">
            <AnalyzeBondCard />
          </div>
        </section>
      )}

      {/* SECTION: Analytics Grid Matrices */}
      <section 
        aria-label="Quantitative Analytics Framework" 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
      >
        {/* Card Panel 1: Quantitative Portfolio Exposure & Value-at-Risk Engine */}
        <div className="w-full border rounded-xl bg-card/20 p-1 flex flex-col shadow-xs hover:border-border/80 transition-colors">
          <RiskAnalytics />
        </div>
        
        {/* Card Panel 2: Physical Climate Modeling & Scenario Projection Arrays */}
        <div className="w-full border rounded-xl bg-card/20 p-1 flex flex-col shadow-xs hover:border-border/80 transition-colors">
          <ClimateMetrics />
        </div>
      </section>

    </div>
  );
}