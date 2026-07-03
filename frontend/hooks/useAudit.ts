'use client';

import { useAppStore } from '@/lib/store';

export function useAudit() {
  // 1. Consume granular state from the store
  const { auditResult, isLoading, error } = useAppStore((state) => ({
    auditResult: state.auditResult,
    isLoading: state.loading.audit, 
    error: state.errors.audit,      
  }));

  // 2. Consume actions
  const { setAuditResult } = useAppStore();

  const clearAudit = () => {
    setAuditResult(null);
  };

  return {
    auditResult,
    setAuditResult,
    clearAudit,
    error,
    isLoading,
  };
}