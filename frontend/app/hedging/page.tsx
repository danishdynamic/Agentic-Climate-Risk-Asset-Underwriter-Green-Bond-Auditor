'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { GenerateStrategyCard } from '@/components/ui/hedging/GenerateStrategyCard';
import { GreeksTable } from '@/components/ui/hedging/GreeksTable'; 
import { PlaybookCard } from '@/components/ui/hedging/PlaybookCard';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';

export default function HedgingPage() {
  const [isEngineOpen, setIsEngineOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-4 py-2">
      
      {/* SECTION: Page Title & Context Header */}
      <section aria-label="Page Header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <PageHeader
          title="Portfolio Hedging Matrix"
          subtitle="Greeks Risk Mitigation & AI Generated Hedging Strategies"
        />
        
        <Button 
          onClick={() => setIsEngineOpen(!isEngineOpen)}
          variant={isEngineOpen ? "outline" : "default"}
          className="sm:w-auto w-full font-medium shadow-sm transition-all"
        >
          {isEngineOpen ? (
            <>
              <X className="mr-2 h-4 w-4" /> Close Strategy Engine
            </>
          ) : (
            <>
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Open Strategy Executor
            </>
          )}
        </Button>
      </section>

      {/* SECTION: Collapsible Strategy Generation Pipeline */}
      {isEngineOpen && (
        <section 
          aria-label="Hedging Execution Engine" 
          className="bg-muted/30 p-6 rounded-xl border max-w-2xl animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Pipeline // Option_Greeks_Simulation
          </div>
          <GenerateStrategyCard />
        </section>
      )}

      {/* SECTION: Risk Sensitivities & Strategy Execution Playbooks */}
      <section 
        aria-label="Hedging and Risk Management Framework" 
        className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start"
      >
        {/* Quantitative Trade Parameters Matrix (Expanded layout real-estate) */}
        <div className="xl:col-span-3 space-y-4">
          <div className="p-1 rounded-lg border bg-card">
            <GreeksTable />
          </div>
        </div>

        {/* AI Mitigation Strategy & Rebalancing Playbook */}
        <div className="xl:col-span-1 w-full xl:sticky xl:top-6">
          <PlaybookCard />
        </div>
      </section>
      
    </div>
  );
}