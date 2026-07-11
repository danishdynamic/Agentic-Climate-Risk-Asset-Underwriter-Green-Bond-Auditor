'use client';

import React from 'react';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { AuditCard } from '@/components/ui/underwriting/AuditCard';
import { RiskScoreCard } from '@/components/ui/underwriting/RiskScoreCard';
import { ShieldCheck } from 'lucide-react';

export default function UnderwritingPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-4 py-2">
      
      {/* SECTION: Page Title & Compliance Context */}
      <section aria-label="Page Header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <PageHeader
          title="AI Underwriting Engine"
          subtitle="Automated Climate Risk Audit & Regulatory Compliance"
        />
        
        {/* Institutional Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center font-mono text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-md px-3 py-1.5 shadow-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span className="font-bold uppercase tracking-wider">Policy Framework: Active</span>
        </div>
      </section>

      {/* SECTION: Underwriting Workspace Matrix */}
      {/* FIX: Flipped columns using order manipulation & expanded the workspace bounds */}
      <section
        aria-label="Underwriting Workspace"
        className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch"
      >
        {/* Results Panel (Spans 3/4 columns to maximize data readability) */}
        {/* FIX: Moved from right side to left side for natural reading order */}
        <div className="xl:col-span-3 order-2 xl:order-1 flex flex-col h-full">
          <div className="border rounded-xl bg-card/20 p-1 shadow-xs h-full">
            <RiskScoreCard />
          </div>
        </div>

        {/* Audit Configuration Controls (Spans 1/4 column) */}
        {/* FIX: Positioned on the right as a standard, clean control panel utility sidebar */}
        <div className="xl:col-span-1 order-1 xl:order-2 w-full xl:sticky xl:top-6">
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest pl-1">
              Configuration Panel
            </div>
            <AuditCard />
          </div>
        </div>
      </section>

    </div>
  );
}