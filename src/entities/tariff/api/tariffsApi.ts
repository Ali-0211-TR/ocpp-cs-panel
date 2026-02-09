import { api } from '@shared/api';
import type { 
  TariffResponse, 
  CreateTariffRequest,
  UpdateTariffRequest,
  CostPreviewRequest,
  CostBreakdownResponse
} from '@shared/api';

const BASE = '/tariffs';

export const tariffsApi = {
  list: () => 
    api.get<TariffResponse[]>(BASE),

  get: (id: string) => 
    api.get<TariffResponse>(`${BASE}/${id}`),

  create: (data: CreateTariffRequest) => 
    api.post<TariffResponse>(BASE, data),

  update: (id: string, data: UpdateTariffRequest) => 
    api.put<TariffResponse>(`${BASE}/${id}`, data),

  delete: (id: string) => 
    api.delete<void>(`${BASE}/${id}`),

  getDefault: () => 
    api.get<TariffResponse>(`${BASE}/default`),

  previewCost: (data: CostPreviewRequest) => 
    api.post<CostBreakdownResponse>(`${BASE}/preview-cost`, data),
};
