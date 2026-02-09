import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from './transactionsApi';
import type { TransactionListParams } from '@shared/api';

// Query keys
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (params?: TransactionListParams) => [...transactionKeys.lists(), params] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: number) => [...transactionKeys.details(), id] as const,
  stats: () => [...transactionKeys.all, 'stats'] as const,
  byChargePoint: (chargePointId: string) => [...transactionKeys.all, 'charge-point', chargePointId] as const,
  activeByChargePoint: (chargePointId: string) => [...transactionKeys.byChargePoint(chargePointId), 'active'] as const,
};

// Queries
export function useTransactions(params?: TransactionListParams) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => transactionsApi.list(params),
    staleTime: 30000,
  });
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionsApi.get(id),
    enabled: !!id,
  });
}

export function useChargePointTransactions(chargePointId: string, params?: TransactionListParams) {
  return useQuery({
    queryKey: [...transactionKeys.byChargePoint(chargePointId), params],
    queryFn: () => transactionsApi.getByChargePoint(chargePointId, params),
    enabled: !!chargePointId,
    staleTime: 30000,
  });
}

export function useActiveTransactions(chargePointId?: string) {
  return useQuery({
    queryKey: chargePointId 
      ? transactionKeys.activeByChargePoint(chargePointId)
      : [...transactionKeys.all, 'active'],
    queryFn: async () => {
      if (chargePointId) {
        return transactionsApi.getActiveByChargePoint(chargePointId);
      }
      const response = await transactionsApi.list({ status: 'Active', page: 1, limit: 20 });
      return response.items;
    },
    staleTime: 5000,
    refetchInterval: 10000,
  });
}

export function useTransactionStats(chargePointId?: string) {
  return useQuery({
    queryKey: [...transactionKeys.stats(), chargePointId],
    queryFn: () => transactionsApi.getStats(chargePointId),
    staleTime: 30000,
  });
}
