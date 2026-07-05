import React from 'react';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { AuditCard } from '@/components/ui/underwriting/AuditCard';
import { RiskScoreCard } from '@/components/ui/underwriting/RiskScoreCard';

export default function UnderwritingPage() {
  return (
    <div className="space-y-8">
      <section aria-label="Page Header">
        <PageHeader
          title="AI Underwriting"
          subtitle="Automated Climate Risk Audit & Regulatory Compliance"
        />
      </section>

      <section
        aria-label="Underwriting Workspace"
        className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start"
      >
        {/* Audit Configuration */}
        <div>
          <AuditCard />
        </div>

        {/* Results */}
        <div className="xl:col-span-2">
          <RiskScoreCard />
        </div>
      </section>
    </div>
  );
}