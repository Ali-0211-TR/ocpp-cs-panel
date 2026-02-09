import { api } from '@shared/api';
import type { 
  TransactionDto, 
  TransactionStats,
  PaginatedResponse,
  TransactionListParams 
} from '@shared/api';

const BASE = '/transactions';
const CP_BASE = '/charge-points';

export const transactionsApi = {
  list: (params?: TransactionListParams) => 
    api.get<PaginatedResponse<TransactionDto>>(BASE, params as Record<string, unknown>),

  get: (id: number) => 
    api.get<TransactionDto>(`${BASE}/${id}`),

  getByChargePoint: (chargePointId: string, params?: TransactionListParams) => 
    api.get<PaginatedResponse<TransactionDto>>(
      `${CP_BASE}/${chargePointId}/transactions`, 
      params as Record<string, unknown>
    ),

  getActiveByChargePoint: (chargePointId: string) => 
    api.get<TransactionDto[]>(`${CP_BASE}/${chargePointId}/transactions/active`),

  getStats: (chargePointId?: string) => {
    if (chargePointId) {
      return api.get<TransactionStats>(`${CP_BASE}/${chargePointId}/transactions/stats`);
    }
    // For global stats, we need to aggregate from charge points or use monitoring
    return api.get<TransactionStats>(`${CP_BASE}/stats`).then(() => ({
      total: 0,
      active: 0,
      completed: 0,
      total_energy_wh: 0,
    }));
  },
};
