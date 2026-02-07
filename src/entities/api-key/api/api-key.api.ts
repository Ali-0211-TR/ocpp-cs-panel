import { apiInstance } from '@shared/api';
import type { ApiResponse } from '@shared/api';
import type { ApiKeyResponse, CreateApiKeyRequest, CreatedApiKeyResponse } from '../model/types';

export const apiKeyApi = {
  list: () =>
    apiInstance.get<ApiResponse<ApiKeyResponse[]>>('/api-keys').then((r) => r.data.data!),
  create: (data: CreateApiKeyRequest) =>
    apiInstance.post<ApiResponse<CreatedApiKeyResponse>>('/api-keys', data).then((r) => r.data.data!),
  delete: (id: number) =>
    apiInstance.delete(`/api-keys/${id}`),
};
