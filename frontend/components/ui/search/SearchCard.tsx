'use client';

import React, { useState, useEffect } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Database, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { AssetAnalysisPreview } from './AssetAnalysisPreview';

const SUGGESTED_QUERIES = [
  { label: 'Analyze Bond', text: 'Analyze bond US1234567890' },
  { label: 'Climate VaR', text: 'Climate VaR exposures' },
  { label: 'Expected Loss', text: 'Expected Loss modeling' },
  { label: 'Compliance', text: 'Green Bond Compliance' },
  { label: 'Hedging', text: 'Hedging Strategy' },
];

const LOADING_MESSAGES = [
  'Searching vector knowledge base...',
  'Retrieving relevant bond documents...',
  'Ranking semantic matches via HNSW index...',
];

export function SearchCard() {
  const [query, setQuery] = useState('');
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const { results, searchAssets, isLoading, error } = useSearch();
  const { setSelectedBond, lastSearchQuery } = useAppStore();

  // Rotate loading messages while fetching results
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMessageIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    await searchAssets(searchQuery, 5);
  };

  const handleChipClick = (text: string) => {
    setQuery(text);
    handleSearch(text);
  };

  return (
    <Card className="rounded-xl border bg-card/60 backdrop-blur shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          Semantic Bond Intelligence
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground leading-relaxed">
          Search prospectuses, ESG disclosures, climate reports, and underwriting knowledge using natural language.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Input Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
            <Input 
              placeholder="Ask about a bond, issuer, ISIN or climate risk..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9 bg-background/50 focus-visible:ring-1"
            />
          </div>
          <Button onClick={() => handleSearch()} disabled={isLoading} className="min-w-27.5 shadow-sm">
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Analyzing
              </>
            ) : (
              'Analyze'
            )}
          </Button>
        </div>

        {/* Quick Search Chips */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1">Suggestions:</span>
          {SUGGESTED_QUERIES.map((chip) => (
            <Badge
              key={chip.label}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80 active:scale-95 transition-all text-[11px] px-2 py-0.5 font-medium"
              onClick={() => handleChipClick(chip.text)}
            >
              {chip.label}
            </Badge>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 text-destructive text-xs p-2.5 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dynamic States Area */}
        <div className="space-y-3 pt-2 border-t border-border/40">
          {isLoading ? (
            /* Rotating Loading State */
            <div className="flex items-center gap-3 p-6 justify-center bg-muted/10 rounded-lg border border-dashed">
              <Loader2 className="animate-spin h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground italic font-medium animate-fade-in">
                {LOADING_MESSAGES[loadingMessageIdx]}
              </span>
            </div>
          ) : results.length === 0 ? (
            /* Empty State */
            <div className="text-xs text-muted-foreground p-5 bg-muted/20 rounded-lg border text-center space-y-2">
              <div className="text-sm">🔍 No matching knowledge found.</div>
              <p className="text-muted-foreground/80">Try modifying your query or matching metrics like:</p>
              <div className="flex flex-wrap justify-center gap-2 text-[10px] font-mono text-muted-foreground">
                <span>• ISIN</span>
                <span>• Bond Name</span>
                <span>• Issuer</span>
                <span>• Climate Topic</span>
                <span>• ESG Keyword</span>
              </div>
            </div>
          ) : (
            /* Results Header & Mapping */
            <>
              {lastSearchQuery && (
                <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-wider font-medium px-1">
                  <span>Knowledge Matches</span>
                  <span>Results for: {lastSearchQuery}</span>
                </div>
              )}
              
              <div className="space-y-3 max-h-100 overflow-y-auto pr-1 custom-scrollbar">
                {results.map((result, i) => (
                  <div 
                    key={i} 
                    className="p-4 border rounded-lg hover:border-primary/40 transition-all bg-card/40 hover:bg-card shadow-sm space-y-3 group"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5">
                        <h4 className="font-semibold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">
                          {result.assetName}
                        </h4>
                        
                        {/* Institutional Info Badges */}
                        <div className="flex gap-1.5 flex-wrap">
                          <Badge variant="outline" className="text-[10px] font-mono uppercase bg-background/50 py-0 px-1.5">
                            {result.rating || 'NR'}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-mono uppercase bg-background/50 py-0 px-1.5">
                            {result.bondType}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-mono uppercase bg-background/50 py-0 px-1.5 tracking-wider">
                            {result.isin}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Similarity Score */}
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Similarity</div>
                        <div className="font-mono text-xs font-bold text-primary">
                          {Math.round((result.score || 0) * 100)}%
                        </div>
                      </div>
                    </div>

                    {/* Excerpt Snippet */}
                    <AssetAnalysisPreview rawData={result.snippet} />

                    {/* Action Button */}
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="w-full text-xs justify-between font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
                      onClick={() => setSelectedBond(result as any)}
                    >
                      <span className="flex items-center gap-2">
                        <Database size={13} /> 
                        Open Asset Context
                      </span>
                      <ChevronRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}