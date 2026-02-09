import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tariffsApi } from './tariffsApi';
import type { CreateTariffRequest, UpdateTariffRequest, CostPreviewRequest } from '@shared/api';
import { toast } from '@shared/ui';

// Query keys
export const tariffKeys = {
  all: ['tariffs'] as const,
  lists: () => [...tariffKeys.all, 'list'] as const,
  list: () => [...tariffKeys.lists()] as const,
  details: () => [...tariffKeys.all, 'detail'] as const,
  detail: (id: string) => [...tariffKeys.details(), id] as const,
  default: () => [...tariffKeys.all, 'default'] as const,
};

// Queries
export function useTariffs() {
  return useQuery({
    queryKey: tariffKeys.list(),
    queryFn: tariffsApi.list,
    staleTime: 60000,
  });
}

export function useTariff(id: string) {
  return useQuery({
    queryKey: tariffKeys.detail(id),
    queryFn: () => tariffsApi.get(id),
    enabled: !!id,
  });
}

export function useDefaultTariff() {
  return useQuery({
    queryKey: tariffKeys.default(),
    queryFn: tariffsApi.getDefault,
    staleTime: 60000,
  });
}

// Mutations
export function useCreateTariff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTariffRequest) => tariffsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tariffKeys.all });
      toast('Тариф создан');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
}

export function useUpdateTariff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTariffRequest }) =>
      tariffsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tariffKeys.all });
      toast('Тариф обновлён');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
}

export function useDeleteTariff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tariffsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tariffKeys.all });
      toast('Тариф удалён');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
}

export function usePreviewCost() {
  return useMutation({
    mutationFn: (data: CostPreviewRequest) => tariffsApi.previewCost(data),
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
}
