import { apiInstance } from '@shared/api';
import type { ApiResponse } from '@shared/api';
import type { HeartbeatStatusDto, ConnectionStatsDto } from '../model/types';

export const monitoringApi = {
  getHeartbeats: () =>
    apiInstance.get<ApiResponse<HeartbeatStatusDto[]>>('/monitoring/heartbeats').then((r) => r.data.data!),
  getOnlineIds: () =>
    apiInstance.get<ApiResponse<string[]>>('/monitoring/online').then((r) => r.data.data!),
  getStats: () =>
    apiInstance.get<ApiResponse<ConnectionStatsDto>>('/monitoring/stats').then((r) => r.data.data!),
};
