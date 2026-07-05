'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

export function useHealth() {
  const health = useAppStore((state) => state.healthStatus);
  const loading = useAppStore((state) => state.loading.agent);
  const error = useAppStore((state) => state.errors.agent);

  const setHealthStatus = useAppStore((state) => state.setHealthStatus);

  const fetchHealth = async () => {
    try {
      const data = await api.getHealthStatus();
      setHealthStatus(data);
    } catch (err) {
      console.error('Health check failed', err);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return {
    health,
    isLoading: loading,
    error,
    fetchHealth,
  };
}