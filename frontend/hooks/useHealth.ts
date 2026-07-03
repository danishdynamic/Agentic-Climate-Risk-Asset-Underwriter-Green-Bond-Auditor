'use client';

import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

export function useHealth() {
  // 1. Match the exact structure of your store
  const { health, loading, error } = useAppStore((state) => ({
    health: state.healthStatus, 
    loading: state.loading.agent,
    error: state.errors.agent
  }));

  const setHealthStatus = useAppStore((state) => state.setHealthStatus);

  const fetchHealth = async () => {
    try {
      const data = await api.getHealthStatus(); 
      setHealthStatus(data);
    } catch (err) {
      console.error("Health check failed", err);
    }
  };

  return { 
    health, 
    isLoading: loading, 
    error, 
    fetchHealth 
  };
}