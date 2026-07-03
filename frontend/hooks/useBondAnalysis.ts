'use client';

import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { BondAnalysis } from '@/lib/types';

export function useBondAnalysis() {
  // Pulling specific state and loading/error slices
  const { analysis, isLoading, error } = useAppStore((state) => ({
    analysis: state.bondAnalysis,
    isLoading: state.loading.audit, // Assuming bond analysis fits under audit/analysis
    error: state.errors.audit,
  }));

  const { setBondAnalysis, setLoading, setError } = useAppStore();

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