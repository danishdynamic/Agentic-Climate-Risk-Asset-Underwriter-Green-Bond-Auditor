'use client';

import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { HedgingStrategy } from '@/lib/types';

export function useHedging() {
  const hedgingResult = useAppStore((state) => state.hedgingResult);
  const isLoading = useAppStore((state) => state.loading.hedging);
  const error = useAppStore((state) => state.errors.hedging);

  // Consume actions from store with explicit selectors
  const setHedgingResult = useAppStore((state) => state.setHedgingResult);
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);

  const calculateHedging = async (bondIsin: string) => {
    // Use 'hedging' key explicitly to satisfy the type definition
    setLoading('hedging', true);
    setError('hedging', undefined);

    try {
      const response: HedgingStrategy = await api.calculateHedgingStrategy({ 
        bond_isin: bondIsin 
      });
      
      setHedgingResult(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Hedging calculation failed';
      setError('hedging', message);
      throw err;
    } finally {
      setLoading('hedging', false);
    }
  };

  return { 
    calculateHedging, 
    hedgingResult, 
    isLoading, 
    error 
  };
}