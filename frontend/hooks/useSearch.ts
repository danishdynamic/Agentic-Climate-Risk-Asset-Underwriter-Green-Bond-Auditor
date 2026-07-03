'use client';

import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { AssetSearchQuery, SearchResult } from '@/lib/types';

export function useSearch() {
  // 1. Consume results, loading, and error from the global store
  const { results, isLoading, error } = useAppStore((state) => ({
    results: state.searchResults,
    isLoading: state.loading.search,
    error: state.errors.search,
  }));

  // 2. Consume setters from the store
  const { setSearchResults, setLoading, setError } = useAppStore();

  const searchAssets = async (query: string, limit?: number) => {
    setLoading('search', true);
    setError('search', undefined);

    try {
      const searchQuery: AssetSearchQuery = { query, limit };
      const data: SearchResult[] = await api.searchAssets(searchQuery);
      
      // Update global store
      setSearchResults(data, query);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError('search', message);
      throw err;
    } finally {
      setLoading('search', false);
    }
  };

  return { 
    results, 
    searchAssets, 
    isLoading, 
    error 
  };
}