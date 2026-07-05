
import React from 'react';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { GenerateStrategyCard } from '@/components/ui/hedging/GenerateStrategyCard';
import { GreeksTable } from '@/components/ui/hedging/GreeksTable'; 
import { PlaybookCard } from '@/components/ui/hedging/PlaybookCard';

export default function HedgingPage() {
  return (
    <div className="space-y-8">
      {/* SECTION: Page Title & Context */}
      <section aria-label="Page Header">
        <PageHeader
          title="Portfolio Hedging"
          subtitle="Greeks Risk Mitigation & AI Generated Hedging Strategies"
        />
      </section>

      {/* SECTION: Operational Strategy Executor */}
      <section aria-label="Hedging Execution Engine" className="max-w-xl">
        <GenerateStrategyCard />
      </section>

      {/* SECTION: Risk Sensitivities & Strategy Execution Playbooks */}
      <section 
        aria-label="Hedging and Risk Management Framework" 
        className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start"
      >
        {/* Quantitative Trade Parameters (Instrument, Hedge Ratio, Est. Cost) */}
        <div className="xl:col-span-2">
          <GreeksTable />
        </div>

        {/* AI Mitigation Strategy & Rebalancing Playbook */}
        <div className="w-full sticky top-6">
          <PlaybookCard />
        </div>
      </section>
    </div>
  );
}