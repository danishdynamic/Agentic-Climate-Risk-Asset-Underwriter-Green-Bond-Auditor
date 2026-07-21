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
    // Ambient color wash outside the structural panels
    <div className="space-y-6 max-w-[1600px] mx-auto px-6 py-4 min-h-screen bg-linear-to-br from-amber-500/1 via-transparent to-blue-500/2">
      
      {/* SECTION: Page Title & Context Header */}
      <section aria-label="Page Header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-4">
        <PageHeader
          title="Portfolio Hedging Matrix"
          subtitle="Greeks Risk Mitigation & AI Generated Hedging Strategies"
        />
        
        <Button 
          onClick={() => setIsEngineOpen(!isEngineOpen)}
          variant={isEngineOpen ? "outline" : "default"}
          className={`sm:w-auto w-full font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-200 ${
            isEngineOpen 
              ? 'border-amber-500/30 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10' 
              : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
          }`}
        >
          {isEngineOpen ? (
            <>
              <X className="mr-2 h-3.5 w-3.5" /> Close Strategy Engine
            </>
          ) : (
            <>
              <SlidersHorizontal className="mr-2 h-3.5 w-3.5" /> Open Strategy Executor
            </>
          )}
        </Button>
      </section>

      {/* SECTION: Collapsible Strategy Generation Pipeline */}
      {isEngineOpen && (
        <section 
          aria-label="Hedging Execution Engine" 
          className="bg-amber-500/3 p-6 rounded-xl border border-amber-500/20 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-200 shadow-2xs"
        >
          <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-3 font-semibold">
            Pipeline // Option_Greeks_Simulation
          </div>
          <GenerateStrategyCard />
        </section>
      )}

      {/* SECTION: Harmonized Grid (Table & Playbook matching spatial footprint) */}
      <section 
        aria-label="Hedging and Risk Management Framework" 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
      >
        {/* Quantitative Trade Parameters Matrix Container */}
        <div className="h-full flex flex-col rounded-xl border border-border/50 bg-card/60 backdrop-blur-md shadow-2xs hover:border-blue-500/20 transition-all duration-300 overflow-hidden">
          <GreeksTable />
        </div>

        {/* AI Mitigation Strategy & Rebalancing Playbook Container */}
        <div className="h-full flex flex-col rounded-xl border border-border/50 bg-card/60 backdrop-blur-md shadow-2xs hover:border-amber-500/20 transition-all duration-300 overflow-hidden">
          <PlaybookCard />
        </div>
      </section>
      
    </div>
  );
}