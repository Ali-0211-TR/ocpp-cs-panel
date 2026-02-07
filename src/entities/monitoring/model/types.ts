export interface HeartbeatStatusDto {
  charge_point_id: string;
  last_heartbeat: string;
  is_online: boolean;
  status: string;
  uptime_seconds: number | null;
  firmware_version: string | null;
}

export interface ConnectionStatsDto {
  total_charge_points: number;
  online_count: number;
  offline_count: number;
  average_uptime_hours: number | null;
}
