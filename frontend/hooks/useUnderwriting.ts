'use client';

import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { UnderwriteInput, AuditResult } from '@/lib/types';

export function useUnderwriting() {
  // 1. Consume loading/error from the global store using 'audit' key
  const { isLoading, error } = useAppStore((state) => ({
    isLoading: state.loading.audit,
    error: state.errors.audit,
  }));

  // 2. Consume actions from the store
  const { setAuditResult, setLoading, setError } = useAppStore();

  const executeUnderwriting = async (isin: string, instruction: string) => {
    // 3. Explicitly use the 'audit' key to satisfy the strict union type
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