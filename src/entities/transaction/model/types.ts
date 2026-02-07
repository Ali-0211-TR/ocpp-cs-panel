export interface TransactionDto {
  id: number;
  charge_point_id: string;
  connector_id: number;
  id_tag: string;
  meter_start: number;
  meter_stop: number | null;
  status: string;
  started_at: string;
  stopped_at: string | null;
  stop_reason: string | null;
  energy_consumed_wh: number | null;
}

export interface TransactionStats {
  total: number;
  active: number;
  completed: number;
  total_energy_kwh: number;
}

export interface TransactionFilters {
  charge_point_id?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}
