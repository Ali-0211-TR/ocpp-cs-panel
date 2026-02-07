import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tariffApi } from './tariff.api';
import type { CreateTariffRequest, UpdateTariffRequest, CostPreviewRequest } from '../model/types';

export const tariffKeys = {
  all: ['tariffs'] as const,
  list: () => [...tariffKeys.all, 'list'] as const,
  detail: (id: number) => [...tariffKeys.all, 'detail', id] as const,
  default: () => [...tariffKeys.all, 'default'] as const,
};

export const useTariffs = () =>
  useQuery({ queryKey: tariffKeys.list(), queryFn: tariffApi.list });

export const useTariff = (id: number) =>
  useQuery({ queryKey: tariffKeys.detail(id), queryFn: () => tariffApi.getById(id), enabled: id > 0 });

export const useDefaultTariff = () =>
  useQuery({ queryKey: tariffKeys.default(), queryFn: tariffApi.getDefault });

export const useCreateTariff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTariffRequest) => tariffApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: tariffKeys.all }),
  });
};

export const useUpdateTariff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTariffRequest }) => tariffApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: tariffKeys.all }),
  });
};

export const useDeleteTariff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tariffApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: tariffKeys.all }),
  });
};

export const usePreviewCost = () =>
  useMutation({ mutationFn: (data: CostPreviewRequest) => tariffApi.previewCost(data) });
