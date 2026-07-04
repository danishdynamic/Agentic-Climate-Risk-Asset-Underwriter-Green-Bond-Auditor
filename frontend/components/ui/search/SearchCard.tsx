'use client';

import React, { useState } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Database, ChevronRight, AlertCircle } from 'lucide-react';

export function SearchCard() {
  const [query, setQuery] = useState('');
  const { results, searchAssets, isLoading, error } = useSearch();
  const { setSelectedBond, lastSearchQuery } = useAppStore();

  const handleSearch = async () => {
    await searchAssets(query, 5);
  };

  return (
    <Card className="rounded-lg border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-widest">Semantic Document Retrieval</CardTitle>
        <CardDescription className="text-xs">Search embedded bond prospectuses using natural language queries.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input 
            placeholder="e.g., 'What are the environmental covenants...'" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isLoading} className="min-w-[100px]">
            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4 mr-2" />}
            Search
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-xs p-2 bg-red-50 rounded">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {lastSearchQuery && results.length > 0 && (
          <p className="text-[10px] text-muted-foreground uppercase">Results for: {lastSearchQuery}</p>
        )}

        <div className="space-y-3 mt-4">
          {isLoading ? (
            <div className="text-xs text-muted-foreground italic">Ranking results via HNSW index...</div>
          ) : results.length === 0 ? (
            <div className="text-xs text-muted-foreground p-4 bg-muted/20 rounded-md">
              No relevant documents were found. Try using broader financial or ESG terms.
            </div>
          ) : (
            results.map((result, i) => (
              <div key={i} className="p-4 border rounded-md hover:border-primary/50 transition-colors bg-card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-sm">{result.assetName}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase">{result.rating} • {result.bondType} • {result.isin}</p>
                  </div>
                  <Badge variant="secondary" className="font-mono">{Math.round((result.score || 0) * 100)}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3 italic">{result.snippet}</p>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="w-full text-xs justify-between"
                  onClick={() => setSelectedBond(result as any)}
                >
                  <span className="flex items-center gap-2"><Database size={14} /> Open Asset</span>
                  <ChevronRight size={14} />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}