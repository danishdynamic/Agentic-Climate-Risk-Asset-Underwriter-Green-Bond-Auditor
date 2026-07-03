'use client';

import React, { useState } from 'react';
import { AppFeedback } from '@/components/common/AppFeedback';
import { useSearch } from '@/hooks/useSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';

export function SearchPanel() {
  const [query, setQuery] = useState('');
  const { results, searchAssets, isLoading, error } = useSearch();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) await searchAssets(query);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Search Bar & Filters */}
      <section className="border-b pb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ISIN, Asset Name, or Risk Profile..." 
            className="rounded-none h-10 border-muted-foreground/30 focus-visible:ring-0"
          />
          <Button type="submit" disabled={isLoading} className="rounded-none h-10 px-8 uppercase text-[10px] tracking-widest">
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? 'Searching...' : 'Execute'}
          </Button>
        </form>
      </section>

      {/* 2. Search Results */}
      <AppFeedback isLoading={isLoading} error={error} isEmpty={results.length === 0}>
        <div className="border rounded-none">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] uppercase font-bold">ISIN</TableHead>
                <TableHead className="text-[10px] uppercase font-bold">Name</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">{result.isin}</TableCell>
                  <TableCell className="text-xs">{result.name}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{result.rating}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AppFeedback>
    </div>
  );
}