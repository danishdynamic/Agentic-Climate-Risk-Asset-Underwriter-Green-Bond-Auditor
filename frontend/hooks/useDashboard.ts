'use client';

import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

export function useDashboard() {
  const health = useAppStore((state) => state.healthStatus);
  const assets = useAppStore((state) => state.assets);
  const isLoading = useAppStore((state) => state.loading.agent); 
  const error = useAppStore((state) => state.errors.agent);

  const setHealthStatus = useAppStore((state) => state.setHealthStatus);
  const setAssets = useAppStore((state) => state.setAssets);
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);

  const fetchDashboardData = async () => {
    setLoading('agent', true);
    setError('agent', undefined);

    try {
      // Fetching in parallel for speed
      const [healthRes, assetsRes] = await Promise.all([
        api.getHealthStatus(), 
        api.getAssets()
      ]);

      setHealthStatus(healthRes);
      setAssets(assetsRes);
    } catch (err) {
      setError('agent', 'Failed to load dashboard data');
    } finally {
      setLoading('agent', false);
    }
  };

  return {
    health,
    assets,
    stats: {
      totalAssets: assets.length,
      isSystemHealthy: health?.status === 'healthy',
    },
    fetchDashboardData,
    isLoading,
    error,
  };
}