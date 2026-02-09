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
  ChangeConfigurationRequest,
  LocalListVersionResponse,
  DataTransferRequest,
  DataTransferResponse,
  ConnectorDto,
} from '@shared/api';

const BASE = '/charge-points';

export const chargePointsApi = {
  // CRUD operations
  list: () => 
    api.get<ChargePointDto[]>(BASE),

  get: (id: string) => 
    api.get<ChargePointDto>(`${BASE}/${id}`),

  delete: (id: string) => 
    api.delete<void>(`${BASE}/${id}`),

  getConnectors: (chargePointId: string) =>
    api.get<ConnectorDto[]>(`${BASE}/${chargePointId}/connectors`),

  createConnector: (chargePointId: string, connectorId: number) =>
    api.post<ConnectorDto>(`${BASE}/${chargePointId}/connectors`, { connector_id: connectorId }),

  deleteConnector: (chargePointId: string, connectorId: number) =>
    api.delete<void>(`${BASE}/${chargePointId}/connectors/${connectorId}`),

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
    api.get<ConfigurationResponse>(`${BASE}/${chargePointId}/configuration`, keys ? { keys: keys.join(',') } : undefined),

  changeConfiguration: (chargePointId: string, data: ChangeConfigurationRequest) =>
    api.put<CommandResponse>(`${BASE}/${chargePointId}/configuration`, data),

  clearCache: (chargePointId: string) =>
    api.post<CommandResponse>(`${BASE}/${chargePointId}/clear-cache`),

  getLocalListVersion: (chargePointId: string) =>
    api.get<LocalListVersionResponse>(`${BASE}/${chargePointId}/local-list-version`),

  dataTransfer: (chargePointId: string, data: DataTransferRequest) =>
    api.post<DataTransferResponse>(`${BASE}/${chargePointId}/data-transfer`, data),
};
