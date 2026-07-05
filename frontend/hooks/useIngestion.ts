'use client';

import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';

export function useIngestion() {
  const isLoading = useAppStore((state) => state.loading.upload);
  const error = useAppStore((state) => state.errors.upload);

  // Consume setters from the store with explicit selectors
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);

  const ingestAsset = async (formData: FormData) => {
    // Use the explicit 'upload' key to satisfy the strict TypeScript union
    setLoading('upload', true);
    setError('upload', undefined);

    try {
      const response = await api.ingestAssetMultipart(formData);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ingestion failed';
      setError('upload', message);
      throw err;
    } finally {
      setLoading('upload', false);
    }
  };

  return { ingestAsset, isLoading, error };
}