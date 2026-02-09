import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { idTagsApi } from './idTagsApi';
import type { CreateIdTagRequest, UpdateIdTagRequest, IdTagListParams } from '@shared/api';
import { toast } from '@shared/ui';

// Query keys
export const idTagKeys = {
  all: ['id-tags'] as const,
  lists: () => [...idTagKeys.all, 'list'] as const,
  list: (params?: IdTagListParams) => [...idTagKeys.lists(), params] as const,
  details: () => [...idTagKeys.all, 'detail'] as const,
  detail: (idTag: string) => [...idTagKeys.details(), idTag] as const,
};

// Queries
export function useIdTags(params?: IdTagListParams) {
  return useQuery({
    queryKey: idTagKeys.list(params),
    queryFn: () => idTagsApi.list(params),
    staleTime: 30000,
  });
}

export function useIdTag(idTag: string) {
  return useQuery({
    queryKey: idTagKeys.detail(idTag),
    queryFn: () => idTagsApi.get(idTag),
    enabled: !!idTag,
  });
}

// Mutations
export function useCreateIdTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIdTagRequest) => idTagsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: idTagKeys.all });
      toast('RFID карта создана');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
}

export function useUpdateIdTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ idTag, data }: { idTag: string; data: UpdateIdTagRequest }) =>
      idTagsApi.update(idTag, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: idTagKeys.all });
      toast('RFID карта обновлена');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
}

export function useDeleteIdTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idTag: string) => idTagsApi.delete(idTag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: idTagKeys.all });
      toast('RFID карта удалена');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
}

export function useBlockIdTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idTag: string) => idTagsApi.block(idTag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: idTagKeys.all });
      toast('RFID карта заблокирована');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
}

export function useUnblockIdTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idTag: string) => idTagsApi.unblock(idTag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: idTagKeys.all });
      toast('RFID карта разблокирована');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
}
