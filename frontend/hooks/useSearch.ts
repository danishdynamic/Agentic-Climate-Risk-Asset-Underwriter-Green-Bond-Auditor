'use client';

import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { AssetSearchQuery } from '@/lib/types';

export function useSearch() {
  const results = useAppStore((state) => state.searchResults);
  const isLoading = useAppStore((state) => state.loading.search);
  const error = useAppStore((state) => state.errors.search);

  // Consume actions from store using explicit individual selectors
  const setSearchResults = useAppStore((state) => state.setSearchResults);
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);

  const searchAssets = async (query: string, limit: number = 5) => {
    setLoading('search', true);
    setError('search', undefined);

    try {
      const searchQuery: AssetSearchQuery = { query, limit };
      const rawData = await api.searchAssets(searchQuery);
      
      // Map the backend response fields to your frontend 'AssetSummary' structure
      // This ensures your UI components receive consistent data
      const normalizedResults = rawData.map((r: any) => ({
          id: r.chunk_id,             
          assetName: r.asset_name,    
          snippet: r.chunk_content,   
          bondType: r.bond_type,      
          rating: r.credit_rating,    
          isin: r.isin,               
          couponRate: r.coupon_rate,  
          score: 1 - r.distance       
      }));

      setSearchResults(normalizedResults, query);
      return normalizedResults;
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