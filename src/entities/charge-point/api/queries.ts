import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chargePointsApi } from './chargePointsApi';
import type {
  ResetRequest,
  RemoteStartRequest,
  RemoteStopRequest,
  UnlockConnectorRequest,
  ChangeAvailabilityRequest,
  TriggerMessageRequest,
  ChangeConfigurationRequest,
  DataTransferRequest
} from '@shared/api';
import { toast } from '@shared/ui';

// Query keys
export const chargePointKeys = {
  all: ['charge-points'] as const,
  lists: () => [...chargePointKeys.all, 'list'] as const,
  list: (params?: ChargePointListParams) => [...chargePointKeys.lists(), params] as const,
  details: () => [...chargePointKeys.all, 'detail'] as const,
  detail: (id: string) => [...chargePointKeys.details(), id] as const,
  stats: () => [...chargePointKeys.all, 'stats'] as const,
  online: () => [...chargePointKeys.all, 'online'] as const,
  configuration: (id: string) => [...chargePointKeys.all, 'config', id] as const,
  connectors: (id: string) => [...chargePointKeys.all, 'connectors', id] as const,
};

export interface ChargePointListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

// Queries
export function useChargePoints(params?: ChargePointListParams) {
  return useQuery({
    queryKey: chargePointKeys.list(params),
    queryFn: () => chargePointsApi.list(params),
    staleTime: 30000,
  });
}

export function useChargePoint(id: string) {
  return useQuery({
    queryKey: chargePointKeys.detail(id),
    queryFn: () => chargePointsApi.get(id),
    enabled: !!id,
  });
}

export function useChargePointStats() {
  return useQuery({
    queryKey: chargePointKeys.stats(),
    queryFn: chargePointsApi.getStats,
    staleTime: 10000,
    refetchInterval: 30000,
  });
}

export function useOnlineChargePoints() {
  return useQuery({
    queryKey: chargePointKeys.online(),
    queryFn: chargePointsApi.getOnline,
    staleTime: 5000,
    refetchInterval: 10000,
  });
}

export function useChargePointConfiguration(chargePointId: string) {
  return useQuery({
    queryKey: chargePointKeys.configuration(chargePointId),
    queryFn: () => chargePointsApi.getConfiguration(chargePointId),
    enabled: !!chargePointId,
  });
}

export function useChargePointConnectors(chargePointId: string) {
  return useQuery({
    queryKey: chargePointKeys.connectors(chargePointId),
    queryFn: () => chargePointsApi.getConnectors(chargePointId),
    enabled: !!chargePointId,
  });
}

// Mutations
export function useDeleteChargePoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chargePointsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chargePointKeys.all });
      toast('Станция удалена');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
}

export function useResetChargePoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chargePointId, data }: { chargePointId: string; data: ResetRequest }) =>
      chargePointsApi.reset(chargePointId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: chargePointKeys.all });
      toast(response.message || `Результат: ${response.status}`);
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
}

export function useRemoteStartTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chargePointId, data }: { chargePointId: string; data: RemoteStartRequest }) =>
      chargePointsApi.remoteStart(chargePointId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: chargePointKeys.all });
      toast(response.message || `Результат: ${response.status}`);
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
}

export function useRemoteStopTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chargePointId, data }: { chargePointId: string; data: RemoteStopRequest }) =>
      chargePointsApi.remoteStop(chargePointId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: chargePointKeys.all });
      toast(response.message || `Результат: ${response.status}`);
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
}

export function useUnlockConnector() {
  return useMutation({
    mutationFn: ({ chargePointId, data }: { chargePointId: string; data: UnlockConnectorRequest }) =>
      chargePointsApi.unlockConnector(chargePointId, data),
    onSuccess: (response) => {
      toast(response.message || `Результат: ${response.status}`);
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
}

export function useChangeAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chargePointId, data }: { chargePointId: string; data: ChangeAvailabilityRequest }) =>
      chargePointsApi.changeAvailability(chargePointId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: chargePointKeys.all });
      toast(response.message || `Результат: ${response.status}`);
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
}

export function useTriggerMessage() {
  return useMutation({
    mutationFn: ({ chargePointId, data }: { chargePointId: string; data: TriggerMessageRequest }) =>
      chargePointsApi.triggerMessage(chargePointId, data),
    onSuccess: (response) => {
      toast(response.message || `Результат: ${response.status}`);
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
}

// New command hooks
export function useChangeConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chargePointId, data }: { chargePointId: string; data: ChangeConfigurationRequest }) =>
      chargePointsApi.changeConfiguration(chargePointId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: chargePointKeys.configuration(variables.chargePointId) });
      if (response.status === 'RebootRequired') {
        toast.warning(`Изменено. Требуется перезагрузка станции`);
      } else if (response.status === 'Accepted') {
        toast.success('Конфигурация успешно изменена');
      } else {
        toast.error(`Станция отклонила изменение: ${response.status}`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Станция не поддерживает эту команду: ${error.message}`);
    },
  });
}

export function useClearCache() {
  return useMutation({
    mutationFn: (chargePointId: string) => chargePointsApi.clearCache(chargePointId),
    onSuccess: (response) => {
      if (response.status === 'Accepted') {
        toast.success('Кэш авторизации очищен');
      } else {
        toast.error(`Станция отклонила: ${response.status}`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Станция не поддерживает эту команду: ${error.message}`);
    },
  });
}

export function useLocalListVersion(chargePointId: string) {
  return useQuery({
    queryKey: [...chargePointKeys.all, 'local-list-version', chargePointId],
    queryFn: () => chargePointsApi.getLocalListVersion(chargePointId),
    enabled: false, // Manual trigger only
  });
}

export function useDataTransfer() {
  return useMutation({
    mutationFn: ({ chargePointId, data }: { chargePointId: string; data: DataTransferRequest }) =>
      chargePointsApi.dataTransfer(chargePointId, data),
    onSuccess: (response) => {
      if (response.status === 'Accepted') {
        toast.success(`Data Transfer успешен${response.data ? `: ${response.data}` : ''}`);
      } else {
        toast.error(`Станция отклонила: ${response.status}`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Станция не поддерживает эту команду: ${error.message}`);
    },
  });
}
