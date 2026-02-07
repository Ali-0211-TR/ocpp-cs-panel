import { apiInstance } from '@shared/api';
import type { ApiResponse } from '@shared/api';
import type {
  ChargePointDto,
  ChargePointStats,
  CommandResponse,
  ChangeAvailabilityRequest,
  RemoteStartRequest,
  RemoteStopRequest,
  ResetRequest,
  TriggerMessageRequest,
  UnlockConnectorRequest,
  ConfigurationResponse,
} from '../model/types';

export const chargePointApi = {
  list: () =>
    apiInstance.get<ApiResponse<ChargePointDto[]>>('/charge-points').then((r) => r.data.data!),

  getById: (id: string) =>
    apiInstance.get<ApiResponse<ChargePointDto>>(`/charge-points/${id}`).then((r) => r.data.data!),

  getStats: () =>
    apiInstance.get<ApiResponse<ChargePointStats>>('/charge-points/stats').then((r) => r.data.data!),

  getOnlineIds: () =>
    apiInstance.get<ApiResponse<string[]>>('/charge-points/online').then((r) => r.data.data!),

  delete: (id: string) =>
    apiInstance.delete(`/charge-points/${id}`),

  // ── Commands ──
  remoteStart: (cpId: string, data: RemoteStartRequest) =>
    apiInstance.post<ApiResponse<CommandResponse>>(`/charge-points/${cpId}/remote-start`, data).then((r) => r.data.data!),

  remoteStop: (cpId: string, data: RemoteStopRequest) =>
    apiInstance.post<ApiResponse<CommandResponse>>(`/charge-points/${cpId}/remote-stop`, data).then((r) => r.data.data!),

  reset: (cpId: string, data: ResetRequest) =>
    apiInstance.post<ApiResponse<CommandResponse>>(`/charge-points/${cpId}/reset`, data).then((r) => r.data.data!),

  changeAvailability: (cpId: string, data: ChangeAvailabilityRequest) =>
    apiInstance.post<ApiResponse<CommandResponse>>(`/charge-points/${cpId}/change-availability`, data).then((r) => r.data.data!),

  triggerMessage: (cpId: string, data: TriggerMessageRequest) =>
    apiInstance.post<ApiResponse<CommandResponse>>(`/charge-points/${cpId}/trigger-message`, data).then((r) => r.data.data!),

  unlockConnector: (cpId: string, data: UnlockConnectorRequest) =>
    apiInstance.post<ApiResponse<CommandResponse>>(`/charge-points/${cpId}/unlock-connector`, data).then((r) => r.data.data!),

  getConfiguration: (cpId: string, keys?: string) =>
    apiInstance.get<ApiResponse<ConfigurationResponse>>(`/charge-points/${cpId}/configuration`, { params: keys ? { keys } : undefined }).then((r) => r.data.data!),
};
