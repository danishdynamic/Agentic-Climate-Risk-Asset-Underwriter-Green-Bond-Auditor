'use client';

import React from 'react';
import { AppFeedback } from '@/components/common/AppFeedback';
import { useBondAnalysis } from '@/hooks/useBondAnalysis';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function AnalyticsPanel() {
  const { analysis, isLoading, error } = useBondAnalysis();

  return (
    <AppFeedback isLoading={isLoading} error={error} isEmpty={!analysis}>
      <div className="space-y-6">
        
        {/* Risk Score - The Primary Metric */}
        <div className="border bg-muted/20 p-6 flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-widest">Aggregate Risk Score</h2>
          <span className="text-4xl font-mono font-bold text-emerald-600">{analysis?.risk_score}/100</span>
        </div>

        {/* Metric Cards - Dense Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['ESG', 'Climate', 'Market', 'Transition'].map((metric) => (
            <Card key={metric} className="rounded-none border-muted p-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2">{metric} Score</h3>
              <div className="h-24 flex items-end">
                {/* Placeholder for your Recharts components */}
                <div className="w-full bg-muted/30 h-[80%]" /> 
              </div>
            </Card>
          ))}
        </div>

        {/* Detailed Breakdown - Accordion style */}
        <Accordion type="single" collapsible className="border rounded-none">
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger className="px-4 text-[10px] uppercase font-bold tracking-widest">
              Detailed Vulnerability Breakdown
            </AccordionTrigger>
            <AccordionContent className="px-4 text-xs text-muted-foreground pb-4 font-mono">
              {analysis?.detailed_breakdown || "No detailed metrics available for this bond."}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </AppFeedback>
  );
}