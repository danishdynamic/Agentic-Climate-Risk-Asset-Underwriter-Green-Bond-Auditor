'use client';

import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { UnderwriteInput, AuditResult } from '@/lib/types';

export function useUnderwriting() {
  const isLoading = useAppStore((state) => state.loading.audit);
  const error = useAppStore((state) => state.errors.audit);

  // Consume actions from the store with explicit individual selectors
  const setAuditResult = useAppStore((state) => state.setAuditResult);
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);

  const executeUnderwriting = async (isin: string, instruction: string) => {
    // Explicitly use the 'audit' key to satisfy the strict union type
    setLoading('audit', true);
    setError('audit', undefined);

    try {
      const data: UnderwriteInput = { isin, instruction };
      const response: AuditResult = await api.executeUnderwriting(data);
      
      setAuditResult(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Underwriting failed';
      setError('audit', message);
      throw err;
    } finally {
      setLoading('audit', false);
    }
  };

  return { executeUnderwriting, isLoading, error };
}