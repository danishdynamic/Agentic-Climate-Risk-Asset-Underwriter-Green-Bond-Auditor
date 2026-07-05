'use client';

import { useAppStore } from '@/lib/store';

export function useAudit() {
  const auditResult = useAppStore((state) => state.auditResult);
  const isLoading = useAppStore((state) => state.loading.audit); 
  const error = useAppStore((state) => state.errors.audit);      

  // Granular action ingestion
  const setAuditResult = useAppStore((state) => state.setAuditResult);

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