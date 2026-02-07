import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chargePointApi } from './charge-point.api';
import type {
  RemoteStartRequest,
  RemoteStopRequest,
  ResetRequest,
  ChangeAvailabilityRequest,
  TriggerMessageRequest,
  UnlockConnectorRequest,
} from '../model/types';

export const chargePointKeys = {
  all: ['charge-points'] as const,
  list: () => [...chargePointKeys.all, 'list'] as const,
  detail: (id: string) => [...chargePointKeys.all, 'detail', id] as const,
  stats: () => [...chargePointKeys.all, 'stats'] as const,
  online: () => [...chargePointKeys.all, 'online'] as const,
};

export const useChargePoints = () =>
  useQuery({ queryKey: chargePointKeys.list(), queryFn: chargePointApi.list });

export const useChargePoint = (id: string) =>
  useQuery({ queryKey: chargePointKeys.detail(id), queryFn: () => chargePointApi.getById(id), enabled: !!id });

export const useChargePointStats = () =>
  useQuery({ queryKey: chargePointKeys.stats(), queryFn: chargePointApi.getStats, refetchInterval: 15_000 });

export const useOnlineChargePoints = () =>
  useQuery({ queryKey: chargePointKeys.online(), queryFn: chargePointApi.getOnlineIds, refetchInterval: 10_000 });

export const useDeleteChargePoint = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chargePointApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: chargePointKeys.all }),
  });
};

export const useRemoteStart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cpId, data }: { cpId: string; data: RemoteStartRequest }) => chargePointApi.remoteStart(cpId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: chargePointKeys.all }),
  });
};

export const useRemoteStop = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cpId, data }: { cpId: string; data: RemoteStopRequest }) => chargePointApi.remoteStop(cpId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: chargePointKeys.all }),
  });
};

export const useResetChargePoint = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cpId, data }: { cpId: string; data: ResetRequest }) => chargePointApi.reset(cpId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: chargePointKeys.all }),
  });
};

export const useChangeAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cpId, data }: { cpId: string; data: ChangeAvailabilityRequest }) => chargePointApi.changeAvailability(cpId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: chargePointKeys.all }),
  });
};

export const useTriggerMessage = () =>
  useMutation({
    mutationFn: ({ cpId, data }: { cpId: string; data: TriggerMessageRequest }) => chargePointApi.triggerMessage(cpId, data),
  });

export const useUnlockConnector = () =>
  useMutation({
    mutationFn: ({ cpId, data }: { cpId: string; data: UnlockConnectorRequest }) => chargePointApi.unlockConnector(cpId, data),
  });
