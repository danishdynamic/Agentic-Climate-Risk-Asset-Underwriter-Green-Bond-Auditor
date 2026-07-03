'use client';

import React from 'react';
import { AppFeedback } from '@/components/common/AppFeedback';
import { useHedging } from '@/hooks/useHedging';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function HedgingPanel() {
  const { strategy, calculateStrategy, isLoading, error } = useHedging();

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Control Bar */}
      <section className="flex items-center justify-between border-b pb-6">
        <h2 className="text-[10px] font-bold uppercase tracking-widest">Hedging Strategy Engine</h2>
        <Button 
          onClick={() => calculateStrategy()} 
          disabled={isLoading}
          className="rounded-none uppercase text-[10px] tracking-widest"
        >
          {isLoading ? 'Calculating...' : 'Run Simulation'}
        </Button>
      </section>

      {/* 2. Feedback Wrapper */}
      <AppFeedback isLoading={isLoading} error={error} isEmpty={!strategy}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Greeks Table */}
          <div className="border rounded-none">
            <h3 className="p-4 text-[10px] font-bold uppercase tracking-widest border-b bg-muted/20">Market Greeks</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">GREEK</TableHead>
                  <TableHead className="text-[10px] text-right">VALUE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {['Delta', 'Gamma', 'Theta', 'Vega'].map((greek) => (
                  <TableRow key={greek}>
                    <TableCell className="font-mono text-xs">{greek}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {strategy?.greeks[greek.toLowerCase() as keyof typeof strategy.greeks]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Strategy Playbook */}
          <div className="space-y-4">
            <div className="border p-4 rounded-none">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4">Recommended Strategy</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-xs">Strike: <span className="font-mono">{strategy?.strike}</span></div>
                <div className="text-xs">Expiry: <span className="font-mono">{strategy?.expiry}</span></div>
              </div>
            </div>
            
            <div className="border p-4 rounded-none bg-muted/20">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2">Playbook Execution</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {strategy?.playbook}
              </p>
            </div>
          </div>
        </div>
      </AppFeedback>
    </div>
  );
}