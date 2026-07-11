'use client';

import React from 'react';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { SearchCard } from '@/components/ui/search/SearchCard';
import { Database } from 'lucide-react';

export default function SearchPage() {
  return (
    // FIX: Constrained max-width to 5xl (1024px) and centered it to prevent raw input stretching
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-4 min-h-[calc(100vh-120px)] flex flex-col">
      
      {/* SECTION: Page Title & Index Status */}
      <section aria-label="Page Header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 shrink-0">
        <PageHeader
          title="Semantic Search Engine"
          subtitle="Query the vector database for real-time climate matrices and bond intelligence"
        />
        
        {/* Dynamic Vector Store State Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-center font-mono text-[11px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-md px-3 py-1.5 shadow-xs">
          <Database className="h-3.5 w-3.5 text-indigo-500" />
          <span className="font-bold uppercase tracking-wider">Index: Vector_Core_v2</span>
        </div>
      </section>

      {/* SECTION: Vector Space Inquiry Engine & Results Ledger */}
      {/* FIX: Set flex-1 to give SearchCard full control over vertical results rendering area */}
      <section 
        aria-label="Semantic Search Interface" 
        className="flex-1 bg-card/10 rounded-xl border border-border/40 p-2 shadow-xs bg-radial from-background to-muted/20"
      >
        <SearchCard />
      </section>
      
    </div>
  );
}