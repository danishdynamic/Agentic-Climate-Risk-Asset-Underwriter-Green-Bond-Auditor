'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { UploadCard } from '@/components/ui/assets/UploadCard';
import { AssetTable } from '@/components/ui/assets/AssetTable';
import { AssetDetails } from '@/components/ui/assets/AssetDetails';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

export default function AssetsPage() {
  const [isIngesting, setIsIngesting] = useState(false);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-4 py-2">
      {/* SECTION: Page Title & Global Actions */}
      <section aria-label="Page Header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <PageHeader 
          title="Asset Management Ledger" 
          subtitle="Ingest, benchmark, and monitor hybrid risk metrics" 
        />
        <Button 
          onClick={() => setIsIngesting(!isIngesting)} 
          variant={isIngesting ? "outline" : "default"}
          className="sm:w-auto w-full font-medium shadow-sm transition-all"
        >
          {isIngesting ? (
            <>
              <X className="mr-2 h-4 w-4" /> Close Risk Ingestion
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> Ingest New Core Asset
            </>
          )}
        </Button>
      </section>

      {/* SECTION: Collapsible Asset Ingestion Data Stream */}
      {isIngesting && (
        <section 
          aria-label="Asset Ingestion Data Stream" 
          className="bg-muted/30 p-6 rounded-xl border animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex justify-between items-center mb-4 max-w-4xl mx-auto">
            <div className="text-xs text-muted-foreground font-mono"> PIPELINE // STRUCTURED_DATA_LOAD </div>
          </div>
          <UploadCard />
        </section>
      )}

      {/* SECTION: Asset Explorer & Metadata Inspector */}
      <section aria-label="Asset Database Explorer" className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Main Ledger Listing (Spans 3 columns to give full field width to tables) */}
        <div className="xl:col-span-3 space-y-4">
          <div className="p-1 rounded-lg border bg-card">
            <AssetTable />
          </div>
        </div>
        
        {/* Contextual Deep-Dive Panel (Spans 1 column, remains cleanly pinned) */}
        <div className="xl:col-span-1 w-full xl:sticky xl:top-6">
          <AssetDetails />
        </div>
        
      </section>
    </div>
  );
}