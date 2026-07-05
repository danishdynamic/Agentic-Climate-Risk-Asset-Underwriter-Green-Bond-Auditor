'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { AssetSummary } from '@/lib/types';

export function useAssets() {
  const assets = useAppStore((state) => state.assets);
  const isLoading = useAppStore((state) => state.loading.agent); 
  const error = useAppStore((state) => state.errors.agent);

  const setAssets = useAppStore((state) => state.setAssets);
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);

  const fetchAssets = async () => {
    // Prevent double-fetching if we already have assets populated in the cache
    if (assets.length > 0) return;

    setLoading('agent', true);
    setError('agent', undefined);

    try {
      const data: AssetSummary[] = await api.getAssets();
      setAssets(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch assets';
      setError('agent', message);
    } finally {
      setLoading('agent', false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []); // Empty dependency array: fetch once on component mount

  return { assets, fetchAssets, isLoading, error };
}