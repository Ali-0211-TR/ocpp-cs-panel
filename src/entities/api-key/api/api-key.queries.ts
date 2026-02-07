import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeyApi } from './api-key.api';
import type { CreateApiKeyRequest } from '../model/types';

export const apiKeyKeys = {
  all: ['api-keys'] as const,
  list: () => [...apiKeyKeys.all, 'list'] as const,
};

export const useApiKeys = () =>
  useQuery({ queryKey: apiKeyKeys.list(), queryFn: apiKeyApi.list });

export const useCreateApiKey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateApiKeyRequest) => apiKeyApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeyKeys.all }),
  });
};

export const useDeleteApiKey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiKeyApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeyKeys.all }),
  });
};
