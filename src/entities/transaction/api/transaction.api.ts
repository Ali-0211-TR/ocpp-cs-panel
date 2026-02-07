import { apiInstance } from '@shared/api';
import type { ApiResponse, PaginatedResponse } from '@shared/api';
import type { TransactionDto, TransactionStats, TransactionFilters } from '../model/types';

export const transactionApi = {
  listAll: (params?: { page?: number; limit?: number }) =>
    apiInstance.get<PaginatedResponse<TransactionDto>>('/transactions', { params }).then((r) => r.data),

  getById: (id: number) =>
    apiInstance.get<ApiResponse<TransactionDto>>(`/transactions/${id}`).then((r) => r.data.data!),

  listForChargePoint: (cpId: string, params?: TransactionFilters) =>
    apiInstance.get<PaginatedResponse<TransactionDto>>(`/charge-points/${cpId}/transactions`, { params }).then((r) => r.data),

  getActive: (cpId: string) =>
    apiInstance.get<ApiResponse<TransactionDto[]>>(`/charge-points/${cpId}/transactions/active`).then((r) => r.data.data!),

  getStats: (cpId: string) =>
    apiInstance.get<ApiResponse<TransactionStats>>(`/charge-points/${cpId}/transactions/stats`).then((r) => r.data.data!),
};
