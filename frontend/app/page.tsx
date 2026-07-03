'use client';

import React from 'react';
import { HealthCard } from '@/components/ui/dashboard/HealthCard';
import { ApiStatus } from '@/components/ui/dashboard/ApiStatus';
import { MetricCard } from '@/components/ui/dashboard/MetricCard';
import { RecentAssets } from '@/components/ui/dashboard/RecentAssets';
import { RiskGauge } from '@/components/ui/analytics/RiskGauge';
import { VaRCard } from '@/components/ui/analytics/VaRCard';
import { ClimateChart } from '@/components/ui/analytics/ClimateChart';
import { PortfolioSummary } from '@/components/ui/analytics/PortfolioSummary';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Climate Risk Dashboard</h1>
              <p className="text-muted-foreground">Agentic Green Bond Underwriter</p>
            </div>
            <div className="flex gap-2">
              <Link href="/search">
                <Button variant="outline">Search</Button>
              </Link>
              <Link href="/assets/upload">
                <Button>Upload Asset</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Top Row - Health & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <HealthCard />
          <MetricCard
            title="Active Assets"
            description="In portfolio"
            value={0}
            icon="📊"
          />
          <MetricCard
            title="Total Risk Score"
            description="Portfolio level"
            value={0}
            icon="⚠️"
          />
          <MetricCard
            title="Climate Exposure"
            description="CO₂ equivalent"
            value="0"
            unit="tonnes"
            icon="🌍"
          />
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <RiskGauge value={0} label="Portfolio Risk" />
          <VaRCard value={0} unit="%" period="1-day" confidence={95} />
          <PortfolioSummary
            totalValue={0}
            assetCount={0}
            riskScore={0}
            returnExpected={0}
          />
        </div>

        {/* Charts & Assets Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <ClimateChart />
          <RecentAssets />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/underwriting">
            <Button className="w-full" variant="default">
              Underwrite Bond
            </Button>
          </Link>
          <Link href="/hedging">
            <Button className="w-full" variant="outline">
              Calculate Hedging
            </Button>
          </Link>
          <Link href="/analytics">
            <Button className="w-full" variant="outline">
              View Analytics
            </Button>
          </Link>
          <Link href="/agent">
            <Button className="w-full" variant="outline">
              Chat with Agent
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
