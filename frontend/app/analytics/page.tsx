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
      <section aria-label="Page Header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-4">
        <PageHeader 
          title="Bond Analytics Workspace" 
          subtitle="Climate Risk Metrics & Transition Pathway Projections" 
        />
        
        <Button 
          onClick={() => setIsFilterBarOpen(!isFilterBarOpen)}
          variant="outline"
          className={`sm:w-auto w-full font-mono text-xs uppercase tracking-wider transition-all duration-200 border ${
            isFilterBarOpen 
              ? 'bg-indigo-500/[0.04] text-indigo-600 dark:text-indigo-400 border-indigo-500/30' 
              : 'bg-background hover:bg-muted border-border/80'
          }`}
        >
          <BarChart3 className={`mr-2 h-3.5 w-3.5 transition-colors ${isFilterBarOpen ? 'text-indigo-500' : 'text-muted-foreground'}`} />
          Scope Parameters
          {isFilterBarOpen ? <ChevronUp className="ml-2 h-3 w-3 text-indigo-500" /> : <ChevronDown className="ml-2 h-3 w-3" />}
        </Button>
      </section>

      {/* SECTION: Collapsible Target Selection Toolbar */}
      {isFilterBarOpen && (
        <section 
          aria-label="Analysis Execution Engine" 
          className="bg-card/30 border border-indigo-500/10 dark:border-indigo-500/20 p-4 rounded-xl shadow-[0_2px_8px_rgba(99,102,241,0.02)] backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-widest mb-2.5">
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
        <div className="w-full border border-indigo-500/10 dark:border-indigo-500/20 rounded-xl bg-indigo-500/[0.01] p-1 flex flex-col shadow-2xs hover:border-indigo-500/30 dark:hover:border-indigo-500/40 transition-all duration-300 group">
          <RiskAnalytics />
        </div>
        
        {/* Card Panel 2: Physical Climate Modeling & Scenario Projection Arrays */}
        <div className="w-full border border-teal-500/10 dark:border-teal-500/20 rounded-xl bg-teal-500/[0.01] p-1 flex flex-col shadow-2xs hover:border-teal-500/30 dark:hover:border-teal-500/40 transition-all duration-300 group">
          <ClimateMetrics />
        </div>
      </section>

    </div>
  );
}