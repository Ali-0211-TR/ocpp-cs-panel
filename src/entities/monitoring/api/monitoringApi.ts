import { api } from '@shared/api';
import type { 
  ConnectionStatsDto, 
  HeartbeatStatusDto 
} from '@shared/api';

const BASE = '/monitoring';

export const monitoringApi = {
  getStats: () => 
    api.get<ConnectionStatsDto>(`${BASE}/stats`),

  getHeartbeats: () => 
    api.get<HeartbeatStatusDto[]>(`${BASE}/heartbeats`),

  getOnline: () => 
    api.get<string[]>(`${BASE}/online`),
};
