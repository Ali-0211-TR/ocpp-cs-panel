import { api } from '@shared/api';
import type { 
  ApiKeyResponse, 
  CreateApiKeyRequest,
  CreatedApiKeyResponse 
} from '@shared/api';

const BASE = '/api-keys';

export const apiKeysApi = {
  list: () => 
    api.get<ApiKeyResponse[]>(BASE),

  create: (data: CreateApiKeyRequest) => 
    api.post<CreatedApiKeyResponse>(BASE, data),

  revoke: (id: string) => 
    api.delete<void>(`${BASE}/${id}`),
};
