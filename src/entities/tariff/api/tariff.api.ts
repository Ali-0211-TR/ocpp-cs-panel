import { apiInstance } from '@shared/api';
import type { ApiResponse } from '@shared/api';
import type { TariffResponse, CreateTariffRequest, UpdateTariffRequest, CostPreviewRequest, CostBreakdownResponse } from '../model/types';

export const tariffApi = {
  list: () =>
    apiInstance.get<ApiResponse<TariffResponse[]>>('/tariffs').then((r) => r.data.data!),
  getById: (id: number) =>
    apiInstance.get<ApiResponse<TariffResponse>>(`/tariffs/${id}`).then((r) => r.data.data!),
  getDefault: () =>
    apiInstance.get<ApiResponse<TariffResponse>>('/tariffs/default').then((r) => r.data.data!),
  create: (data: CreateTariffRequest) =>
    apiInstance.post<ApiResponse<TariffResponse>>('/tariffs', data).then((r) => r.data.data!),
  update: (id: number, data: UpdateTariffRequest) =>
    apiInstance.put<ApiResponse<TariffResponse>>(`/tariffs/${id}`, data).then((r) => r.data.data!),
  delete: (id: number) =>
    apiInstance.delete(`/tariffs/${id}`),
  previewCost: (data: CostPreviewRequest) =>
    apiInstance.post<ApiResponse<CostBreakdownResponse>>('/tariffs/preview-cost', data).then((r) => r.data.data!),
};
