'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { AssetSummary } from '@/lib/types';

export function useAssets() {
  // Access global state and actions
  const { assets, isLoading, error } = useAppStore((state) => ({
    assets: state.assets,
    isLoading: state.loading.agent, // Or a dedicated 'assets' loading key
    error: state.errors.agent,      // Or a dedicated 'assets' error key
  }));

  const { setAssets, setLoading, setError } = useAppStore();

  const fetchAssets = async () => {
    // Prevent double-fetching if we already have assets
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
  }, []); // Empty dependency array: fetch once on mount

  return { assets, fetchAssets, isLoading, error };
}