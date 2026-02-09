import { useQuery } from '@tanstack/react-query';
import { monitoringApi } from './monitoringApi';

// Query keys
export const monitoringKeys = {
  all: ['monitoring'] as const,
  stats: () => [...monitoringKeys.all, 'stats'] as const,
  heartbeats: () => [...monitoringKeys.all, 'heartbeats'] as const,
  online: () => [...monitoringKeys.all, 'online'] as const,
};

// Queries
export function useMonitoringStats() {
  return useQuery({
    queryKey: monitoringKeys.stats(),
    queryFn: monitoringApi.getStats,
    staleTime: 5000,
    refetchInterval: 10000,
  });
}

export function useHeartbeats() {
  return useQuery({
    queryKey: monitoringKeys.heartbeats(),
    queryFn: monitoringApi.getHeartbeats,
    staleTime: 5000,
    refetchInterval: 15000,
  });
}

export function useMonitoringOnlineChargePoints() {
  return useQuery({
    queryKey: monitoringKeys.online(),
    queryFn: monitoringApi.getOnline,
    staleTime: 5000,
    refetchInterval: 10000,
  });
}
