import { useQuery } from '@tanstack/react-query';
import { monitoringApi } from './monitoring.api';

export const monitoringKeys = {
  all: ['monitoring'] as const,
  heartbeats: () => [...monitoringKeys.all, 'heartbeats'] as const,
  online: () => [...monitoringKeys.all, 'online'] as const,
  stats: () => [...monitoringKeys.all, 'stats'] as const,
};

export const useHeartbeats = () =>
  useQuery({ queryKey: monitoringKeys.heartbeats(), queryFn: monitoringApi.getHeartbeats, refetchInterval: 15_000 });

export const useOnlineChargePointIds = () =>
  useQuery({ queryKey: monitoringKeys.online(), queryFn: monitoringApi.getOnlineIds, refetchInterval: 10_000 });

export const useConnectionStats = () =>
  useQuery({ queryKey: monitoringKeys.stats(), queryFn: monitoringApi.getStats, refetchInterval: 30_000 });
