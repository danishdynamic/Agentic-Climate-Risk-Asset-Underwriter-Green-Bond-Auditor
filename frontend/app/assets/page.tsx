'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { UploadCard } from '@/components/ui/assets/UploadCard';
import { AssetTable } from '@/components/ui/assets/AssetTable';
import { AssetDetails } from '@/components/ui/assets/AssetDetails';
import { Button } from '@/components/ui/button';
import { Plus, X, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssetsPage() {
  const [isIngesting, setIsIngesting] = useState(false);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-4 py-4">
      {/* SECTION: Page Title & Global Actions */}
      <section aria-label="Page Header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-4">
        <PageHeader 
          title="Asset Management Ledger" 
          subtitle="Ingest, benchmark, and monitor hybrid risk metrics" 
        />
        <Button 
          onClick={() => setIsIngesting(!isIngesting)} 
          variant={isIngesting ? "outline" : "default"}
          className="sm:w-auto w-full font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200"
        >
          {isIngesting ? (
            <>
              <X className="mr-2 h-3.5 w-3.5" /> Close Ingestion Pipeline
            </>
          ) : (
            <>
              <Plus className="mr-2 h-3.5 w-3.5" /> Ingest Core Asset
            </>
          )}
        </Button>
      </section>

      {/* SECTION: Collapsible Asset Ingestion Data Stream via Framer Motion */}
      <AnimatePresence initial={false}>
        {isIngesting && (
          <motion.section 
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
            aria-label="Asset Ingestion Data Stream" 
            className="overflow-hidden"
          >
            <div className="bg-muted/20 p-6 rounded-xl border border-border/60 backdrop-blur-xs mb-2">
              <div className="flex justify-between items-center mb-4 max-w-4xl mx-auto">
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold tracking-widest animate-pulse"> 
                  PIPELINE // STRUCTURED_DATA_LOAD
                </div>
              </div>
              <UploadCard />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* SECTION: Asset Explorer & Metadata Inspector Layout */}
      <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest pl-1">
        Core Matrix Records
      </div>
      
      <section aria-label="Asset Database Explorer" className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Main Ledger Listing */}
        <div className="xl:col-span-3 space-y-4">
          <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-md overflow-hidden p-1">
            <AssetTable />
          </div>
        </div>
        
        {/* Contextual Pinned Inspector Drawer */}
        <div className="xl:col-span-1 w-full xl:sticky xl:top-6">
          <AnimatePresence mode="wait">
            <AssetDetails />
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}