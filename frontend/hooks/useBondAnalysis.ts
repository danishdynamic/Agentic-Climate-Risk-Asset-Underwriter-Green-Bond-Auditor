'use client';

import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { BondAnalysis } from '@/lib/types';

export function useBondAnalysis() {
  const analysis = useAppStore((state) => state.bondAnalysis);
  const isLoading = useAppStore((state) => state.loading.audit);
  const error = useAppStore((state) => state.errors.audit);

  const setBondAnalysis = useAppStore((state) => state.setBondAnalysis);
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);

  /**
   * Standardized signature: Accepts ISIN and Rating
   */
  const analyzeBond = async (bondISIN: string, creditRating: string) => {
    setLoading('audit', true);
    setError('audit', undefined);

    try {
      // API call now matches your requested signature
      const response: BondAnalysis = await api.analyzeBond(bondISIN, creditRating);
      
      setBondAnalysis(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bond analysis failed';
      setError('audit', message);
      throw err;
    } finally {
      setLoading('audit', false);
    }
  };

  return { 
    analyzeBond, 
    analysis, 
    isLoading, 
    error 
  };
}