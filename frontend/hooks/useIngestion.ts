'use client';

import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';

export function useIngestion() {
  // 1. Consume loading and error state from the store using the 'upload' key
  const { isLoading, error } = useAppStore((state) => ({
    isLoading: state.loading.upload,
    error: state.errors.upload,
  }));

  // 2. Consume setters from the store
  const { setLoading, setError } = useAppStore();

  const ingestAsset = async (formData: FormData) => {
    // 3. Use the explicit 'upload' key to satisfy the strict TypeScript union
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