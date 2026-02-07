export interface TariffResponse {
  id: number;
  name: string;
  tariff_type: string;
  price_per_kwh: number;
  price_per_minute: number;
  session_fee: number;
  currency: string;
  min_fee: number;
  max_fee: number;
  is_active: boolean;
  is_default: boolean;
  description: string | null;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTariffRequest {
  name: string;
  tariff_type: string;
  price_per_kwh: number;
  price_per_minute: number;
  session_fee: number;
  currency: string;
  description?: string | null;
  is_active?: boolean | null;
  is_default?: boolean | null;
  min_fee?: number | null;
  max_fee?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
}

export interface UpdateTariffRequest {
  name?: string | null;
  tariff_type?: string | null;
  price_per_kwh?: number | null;
  price_per_minute?: number | null;
  session_fee?: number | null;
  currency?: string | null;
  description?: string | null;
  is_active?: boolean | null;
  is_default?: boolean | null;
  min_fee?: number | null;
  max_fee?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
}

export interface CostPreviewRequest {
  energy_wh: number;
  duration_seconds: number;
  tariff_id?: number | null;
}

export interface CostBreakdownResponse {
  energy_cost: number;
  time_cost: number;
  session_fee: number;
  subtotal: number;
  total: number;
  currency: string;
  formatted_total: string;
}
