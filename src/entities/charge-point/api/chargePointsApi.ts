import { api } from '@shared/api';
import type { 
  ChargePointDto, 
  ChargePointStats,
  CommandResponse,
  ResetRequest,
  RemoteStartRequest,
  RemoteStopRequest,
  UnlockConnectorRequest,
  ChangeAvailabilityRequest,
  TriggerMessageRequest,
  ConfigurationResponse,
  ConnectorDto,
  PaginatedResponse
} from '@shared/api';
import type { ChargePointListParams } from './queries';

const BASE = '/charge-points';

export const chargePointsApi = {
  // CRUD operations
  list: (params?: ChargePointListParams) => 
    api.get<PaginatedResponse<ChargePointDto>>(BASE, params as Record<string, unknown>),

  get: (id: string) => 
    api.get<ChargePointDto>(`${BASE}/${id}`),

  delete: (id: string) => 
    api.delete<void>(`${BASE}/${id}`),

  getConnectors: (chargePointId: string) =>
    api.get<ConnectorDto[]>(`${BASE}/${chargePointId}/connectors`),

  // Statistics
  getStats: () => 
    api.get<ChargePointStats>(`${BASE}/stats`),

  getOnline: () => 
    api.get<string[]>(`${BASE}/online`),

  // Commands
  reset: (chargePointId: string, data: ResetRequest) => 
    api.post<CommandResponse>(`${BASE}/${chargePointId}/reset`, data),

  remoteStart: (chargePointId: string, data: RemoteStartRequest) => 
    api.post<CommandResponse>(`${BASE}/${chargePointId}/remote-start`, data),

  remoteStop: (chargePointId: string, data: RemoteStopRequest) => 
    api.post<CommandResponse>(`${BASE}/${chargePointId}/remote-stop`, data),

  unlockConnector: (chargePointId: string, data: UnlockConnectorRequest) => 
    api.post<CommandResponse>(`${BASE}/${chargePointId}/unlock-connector`, data),

  changeAvailability: (chargePointId: string, data: ChangeAvailabilityRequest) => 
    api.post<CommandResponse>(`${BASE}/${chargePointId}/change-availability`, data),

  triggerMessage: (chargePointId: string, data: TriggerMessageRequest) => 
    api.post<CommandResponse>(`${BASE}/${chargePointId}/trigger-message`, data),

  getConfiguration: (chargePointId: string, keys?: string[]) => 
    api.get<ConfigurationResponse>(`${BASE}/${chargePointId}/configuration`, { key: keys }),
};
