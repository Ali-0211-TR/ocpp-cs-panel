import { useQuery } from '@tanstack/react-query';
import { transactionApi } from './transaction.api';
import type { TransactionFilters } from '../model/types';

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (params?: { page?: number; limit?: number }) => [...transactionKeys.all, 'list', params] as const,
  detail: (id: number) => [...transactionKeys.all, 'detail', id] as const,
  forCp: (cpId: string, filters?: TransactionFilters) => [...transactionKeys.all, 'cp', cpId, filters] as const,
  active: (cpId: string) => [...transactionKeys.all, 'active', cpId] as const,
  stats: (cpId: string) => [...transactionKeys.all, 'stats', cpId] as const,
};

export const useTransactions = (params?: { page?: number; limit?: number }) =>
  useQuery({ queryKey: transactionKeys.list(params), queryFn: () => transactionApi.listAll(params) });

export const useTransaction = (id: number) =>
  useQuery({ queryKey: transactionKeys.detail(id), queryFn: () => transactionApi.getById(id), enabled: id > 0 });

export const useChargePointTransactions = (cpId: string, filters?: TransactionFilters) =>
  useQuery({
    queryKey: transactionKeys.forCp(cpId, filters),
    queryFn: () => transactionApi.listForChargePoint(cpId, filters),
    enabled: !!cpId,
  });

export const useActiveTransactions = (cpId: string) =>
  useQuery({
    queryKey: transactionKeys.active(cpId),
    queryFn: () => transactionApi.getActive(cpId),
    enabled: !!cpId,
    refetchInterval: 10_000,
  });

export const useTransactionStats = (cpId: string) =>
  useQuery({
    queryKey: transactionKeys.stats(cpId),
    queryFn: () => transactionApi.getStats(cpId),
    enabled: !!cpId,
  });
