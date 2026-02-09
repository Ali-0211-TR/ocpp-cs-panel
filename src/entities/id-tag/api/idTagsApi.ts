import { api } from '@shared/api';
import type { 
  IdTagDto, 
  CreateIdTagRequest,
  UpdateIdTagRequest,
  PaginatedResponse,
  IdTagListParams 
} from '@shared/api';

const BASE = '/id-tags';

export const idTagsApi = {
  list: (params?: IdTagListParams) => 
    api.get<PaginatedResponse<IdTagDto>>(BASE, params as Record<string, unknown>),

  get: (idTag: string) => 
    api.get<IdTagDto>(`${BASE}/${idTag}`),

  create: (data: CreateIdTagRequest) => 
    api.post<IdTagDto>(BASE, data),

  update: (idTag: string, data: UpdateIdTagRequest) => 
    api.put<IdTagDto>(`${BASE}/${idTag}`, data),

  delete: (idTag: string) => 
    api.delete<void>(`${BASE}/${idTag}`),

  block: (idTag: string) => 
    api.post<IdTagDto>(`${BASE}/${idTag}/block`),

  unblock: (idTag: string) => 
    api.post<IdTagDto>(`${BASE}/${idTag}/unblock`),
};
