'use client';

import React, { useState } from 'react';
import { AppFeedback } from '@/components/common/AppFeedback';
import { useUnderwriting } from '@/hooks/useUnderwriting';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function UnderwritingPanel() {
  const [instruction, setInstruction] = useState('');
  const { audit, runAudit, isLoading, error } = useUnderwriting();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Control Column */}
      <section className="lg:col-span-1 flex flex-col gap-4">
        <div className="border p-4 bg-muted/10 rounded-none">
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4">Underwriting Audit</h3>
          <Textarea 
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Enter underwriting guidelines or asset parameters..."
            className="rounded-none min-h-[200px] mb-4 text-xs"
          />
          <Button 
            onClick={() => runAudit(instruction)}
            disabled={isLoading || !instruction}
            className="w-full rounded-none uppercase text-[10px] tracking-widest"
          >
            {isLoading ? 'Running Audit...' : 'Execute Audit'}
          </Button>
        </div>
      </section>

      {/* 2. Results Column */}
      <section className="lg:col-span-2">
        <AppFeedback isLoading={isLoading} error={error} isEmpty={!audit}>
          <div className="space-y-6">
            {/* Audit Summary */}
            <div className="border p-4 rounded-none">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2">Summary</h3>
              <p className="text-sm text-muted-foreground font-mono">{audit?.summary}</p>
            </div>

            {/* Compliance & Vulnerabilities Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="rounded-none border-emerald-200 bg-emerald-50/20 p-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2">Compliance</h3>
                <div className="text-xs">{audit?.compliance_score}% Verified</div>
              </Card>
              <Card className="rounded-none border-red-200 bg-red-50/20 p-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2">Vulnerabilities</h3>
                <div className="text-xs text-red-700">{audit?.risk_count} Issues Detected</div>
              </Card>
            </div>
          </div>
        </AppFeedback>
      </section>
    </div>
  );
}