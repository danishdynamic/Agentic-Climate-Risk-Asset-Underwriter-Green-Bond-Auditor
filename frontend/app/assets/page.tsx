import React from 'react';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { UploadCard } from '@/components/ui/assets/UploadCard';
import { AssetTable } from '@/components/ui/assets/AssetTable';
import { AssetDetails } from '@/components/ui/assets/AssetDetails';

export default function AssetsPage() {
  return (
    <div className="space-y-8">
      {/* SECTION: Page Title & Context */}
      <section aria-label="Page Header">
        <PageHeader 
          title="Asset Management" 
          subtitle="Upload & Browse Bonds" 
        />
      </section>

      {/* SECTION: Asset Ingestion Form */}
      <section aria-label="Asset Ingestion Data Stream" className="bg-background/40 rounded-xl p-1">
        <UploadCard />
      </section>

      {/* SECTION: Asset Explorer & Metadata Inspector */}
      <section aria-label="Asset Database Explorer" className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Main Ledger Listing */}
        <div className="xl:col-span-2">
          <AssetTable />
        </div>
        
        {/* Contextual Deep-Dive Panel */}
        <div className="w-full sticky top-6">
          <AssetDetails />
        </div>
      </section>
    </div>
  );
}