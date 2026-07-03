'use client';

import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { HedgingStrategy } from '@/lib/types';

export function useHedging() {
  // 1. Consume state from store
  const { hedgingResult, isLoading, error } = useAppStore((state) => ({
    hedgingResult: state.hedgingResult,
    isLoading: state.loading.hedging,
    error: state.errors.hedging,
  }));

  // 2. Consume actions from store
  const { setHedgingResult, setLoading, setError } = useAppStore();

  const calculateHedging = async (bondId: number) => {
    // Use 'hedging' key explicitly to satisfy the type definition
    setLoading('hedging', true);
    setError('hedging', undefined);

    try {
      const response: HedgingStrategy = await api.calculateHedgingStrategy({ 
        bond_id: bondId 
      });
      
      setHedgingResult(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Hedging calculation failed';
      // Use 'hedging' key here as well
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