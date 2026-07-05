import React from 'react';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { SearchCard } from '@/components/ui/search/SearchCard';

export default function SearchPage() {
  return (
    <div className="space-y-8">
      {/* SECTION: Page Title & Context */}
      <section aria-label="Page Header">
        <PageHeader
          title="Semantic Search"
          subtitle="Query the vector database for climate and bond intelligence"
        />
      </section>

      {/* SECTION: Vector Space Inquiry Engine & Results Ledger */}
      <section aria-label="Semantic Search Interface">
        <SearchCard />
      </section>
    </div>
  );
}