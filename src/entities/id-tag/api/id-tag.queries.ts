import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { idTagApi } from './id-tag.api';
import type { CreateIdTagRequest, UpdateIdTagRequest } from '../model/types';

export const idTagKeys = {
  all: ['id-tags'] as const,
  list: (params?: Record<string, unknown>) => [...idTagKeys.all, 'list', params] as const,
  detail: (id: string) => [...idTagKeys.all, 'detail', id] as const,
};

export const useIdTags = (params?: { status?: string; is_active?: boolean; page?: number; page_size?: number }) =>
  useQuery({ queryKey: idTagKeys.list(params), queryFn: () => idTagApi.list(params) });

export const useIdTag = (idTag: string) =>
  useQuery({ queryKey: idTagKeys.detail(idTag), queryFn: () => idTagApi.getById(idTag), enabled: !!idTag });

export const useCreateIdTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIdTagRequest) => idTagApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: idTagKeys.all }),
  });
};

export const useUpdateIdTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idTag, data }: { idTag: string; data: UpdateIdTagRequest }) => idTagApi.update(idTag, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: idTagKeys.all }),
  });
};

export const useDeleteIdTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idTag: string) => idTagApi.delete(idTag),
    onSuccess: () => qc.invalidateQueries({ queryKey: idTagKeys.all }),
  });
};

export const useBlockIdTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idTag: string) => idTagApi.block(idTag),
    onSuccess: () => qc.invalidateQueries({ queryKey: idTagKeys.all }),
  });
};

export const useUnblockIdTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idTag: string) => idTagApi.unblock(idTag),
    onSuccess: () => qc.invalidateQueries({ queryKey: idTagKeys.all }),
  });
};
