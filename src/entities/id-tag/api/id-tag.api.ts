import { apiInstance } from '@shared/api';
import type { ApiResponse, PaginatedResponse } from '@shared/api';
import type { IdTagDto, CreateIdTagRequest, UpdateIdTagRequest } from '../model/types';

export const idTagApi = {
  list: (params?: { status?: string; is_active?: boolean; user_id?: string; page?: number; page_size?: number }) =>
    apiInstance.get<PaginatedResponse<IdTagDto>>('/id-tags', { params }).then((r) => r.data),

  getById: (idTag: string) =>
    apiInstance.get<ApiResponse<IdTagDto>>(`/id-tags/${idTag}`).then((r) => r.data.data!),

  create: (data: CreateIdTagRequest) =>
    apiInstance.post<ApiResponse<IdTagDto>>('/id-tags', data).then((r) => r.data.data!),

  update: (idTag: string, data: UpdateIdTagRequest) =>
    apiInstance.put<ApiResponse<IdTagDto>>(`/id-tags/${idTag}`, data).then((r) => r.data.data!),

  delete: (idTag: string) =>
    apiInstance.delete(`/id-tags/${idTag}`),

  block: (idTag: string) =>
    apiInstance.post<ApiResponse<IdTagDto>>(`/id-tags/${idTag}/block`).then((r) => r.data.data!),

  unblock: (idTag: string) =>
    apiInstance.post<ApiResponse<IdTagDto>>(`/id-tags/${idTag}/unblock`).then((r) => r.data.data!),
};
