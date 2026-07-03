'use client';

import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

export function useDashboard() {
  const { health, assets, isLoading, error } = useAppStore((state) => ({
    health: state.healthStatus,
    assets: state.assets,
    isLoading: state.loading.agent, // Or a dedicated 'dashboard' loading key
    error: state.errors.agent,
  }));

  const { setHealthStatus, setAssets, setLoading, setError } = useAppStore();

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