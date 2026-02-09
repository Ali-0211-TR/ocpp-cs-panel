// ============================================
// API Response Wrappers
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ============================================
// Authentication Types
// ============================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  token_type: string;
  expires_in: number;
  user: UserInfo;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: string;
}

// ============================================
// Charge Point Types
// ============================================

export interface ChargePointDto {
  id: string;
  vendor?: string | null;
  model?: string | null;
  serial_number?: string | null;
  firmware_version?: string | null;
  iccid?: string | null;
  imsi?: string | null;
  status: string;
  is_online: boolean;
  connectors: ConnectorDto[];
  last_heartbeat?: string | null;
  registered_at: string;
}

export interface ConnectorDto {
  id: number;
  status: string;
  error_code?: string | null;
  error_info?: string | null;
}

export interface ChargePointStats {
  total: number;
  online: number;
  offline: number;
  charging: number;
}

// ============================================
// Command Types
// ============================================

export interface CommandResponse {
  status: string;
  message?: string;
}

export interface ResetRequest {
  type: 'Soft' | 'Hard';
}

export interface RemoteStartRequest {
  id_tag: string;
  connector_id?: number;
}

export interface RemoteStopRequest {
  transaction_id: number;
}

export interface UnlockConnectorRequest {
  connector_id: number;
}

export interface ChangeAvailabilityRequest {
  connector_id: number;
  type: 'Operative' | 'Inoperative';
}

export interface TriggerMessageRequest {
  message: string;
  connector_id?: number;
}

export interface ConfigValue {
  key: string;
  value?: string | null;
  readonly: boolean;
}

export interface ConfigurationResponse {
  configuration: ConfigValue[];
  unknown_keys: string[];
}

export interface ChangeConfigurationRequest {
  key: string;
  value: string;
}

export interface LocalListVersionResponse {
  list_version: number;
}

export interface DataTransferRequest {
  vendor_id: string;
  message_id?: string;
  data?: string;
}

export interface DataTransferResponse {
  status: string;
  data?: string;
}

// ============================================
// IdTag Types
// ============================================

export interface IdTagDto {
  id_tag: string;
  name?: string | null;
  status: string;
  parent_id_tag?: string | null;
  expiry_date?: string | null;
  max_active_transactions?: number | null;
  user_id?: string | null;
  is_active: boolean;
  last_used_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateIdTagRequest {
  id_tag: string;
  name?: string;
  status?: string;
  parent_id_tag?: string;
  expiry_date?: string;
  max_active_transactions?: number;
  user_id?: string;
}

export interface UpdateIdTagRequest {
  name?: string;
  status?: string;
  parent_id_tag?: string;
  expiry_date?: string;
  max_active_transactions?: number;
  user_id?: string;
}

export interface IdTagListParams extends PaginationParams {
  status?: string;
  search?: string;
  is_active?: boolean;
}

// ============================================
// Transaction Types
// ============================================

export interface TransactionDto {
  id: number;
  charge_point_id: string;
  connector_id: number;
  id_tag: string;
  meter_start: number;
  meter_stop?: number | null;
  energy_consumed_wh?: number | null;
  status: string;
  started_at: string;
  stopped_at?: string | null;
  stop_reason?: string | null;
  tariff_id?: string | null;
  energy_cost?: number | null;
  time_cost?: number | null;
  session_fee?: number | null;
  total_cost?: number | null;
  currency?: string | null;
}

export interface TransactionStats {
  total: number;
  active: number;
  completed: number;
  total_energy_wh: number;
}

export interface TransactionListParams extends PaginationParams {
  status?: string;
  charge_point_id?: string;
  id_tag?: string;
  connector_id?: number;
  start_date?: string;
  end_date?: string;
}

// ============================================
// Tariff Types
// ============================================

export interface TariffResponse {
  id: string;
  name: string;
  description?: string | null;
  tariff_type: string;
  price_per_kwh: number;
  price_per_minute: number;
  session_fee: number;
  currency: string;
  is_default: boolean;
  is_active: boolean;
  min_fee: number;
  max_fee: number;
  valid_from?: string | null;
  valid_until?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTariffRequest {
  name: string;
  description?: string;
  tariff_type: 'PerKwh' | 'PerMinute' | 'PerSession' | 'Combined';
  price_per_kwh: number;
  price_per_minute: number;
  session_fee: number;
  currency: string;
  is_default?: boolean;
  is_active?: boolean;
  min_fee?: number;
  max_fee?: number;
  valid_from?: string;
  valid_until?: string;
}

export interface UpdateTariffRequest {
  name?: string;
  description?: string;
  tariff_type?: 'PerKwh' | 'PerMinute' | 'PerSession' | 'Combined';
  price_per_kwh?: number;
  price_per_minute?: number;
  session_fee?: number;
  currency?: string;
  is_default?: boolean;
  is_active?: boolean;
  min_fee?: number;
  max_fee?: number;
  valid_from?: string;
  valid_until?: string;
}

export interface CostPreviewRequest {
  tariff_id?: string;
  energy_wh: number;
  duration_seconds: number;
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

// ============================================
// Monitoring Types
// ============================================

export interface ConnectionStatsDto {
  total: number;
  online: number;
  offline: number;
  stale: number;
}

export interface HeartbeatStatusDto {
  charge_point_id: string;
  is_connected: boolean;
  status: string;
  last_heartbeat?: string | null;
  last_seen?: string | null;
  seconds_since_heartbeat?: number | null;
}

// ============================================
// API Key Types
// ============================================

export interface ApiKeyResponse {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  is_active: boolean;
  created_at: string;
  expires_at?: string | null;
  last_used_at?: string | null;
}

export interface CreateApiKeyRequest {
  name: string;
  scopes: string[];
  expires_in_days?: number;
}

export interface CreatedApiKeyResponse {
  key: string;
  api_key: ApiKeyResponse;
}

// ============================================
// WebSocket Event Types
// ============================================

export interface WsEvent {
  id: string;
  timestamp: string;
  event_type: WsEventType;
  charge_point_id: string;
  data: Record<string, unknown>;
}

export type WsEventType =
  | 'charge_point_connected'
  | 'charge_point_disconnected'
  | 'charge_point_status_changed'
  | 'boot_notification'
  | 'heartbeat_received'
  | 'connector_status_changed'
  | 'transaction_started'
  | 'transaction_stopped'
  | 'meter_values'
  | 'meter_values_received'
  | 'authorization_result'
  | 'error';

export interface ChargePointConnectedEvent {
  charge_point_id: string;
}

export interface ChargePointDisconnectedEvent {
  charge_point_id: string;
  reason?: string;
}

export interface BootNotificationEvent {
  charge_point_id: string;
  vendor: string;
  model: string;
  serial_number?: string;
  firmware_version?: string;
}

export interface HeartbeatEvent {
  charge_point_id: string;
  timestamp: string;
}

export interface ConnectorStatusChangedEvent {
  charge_point_id: string;
  connector_id: number;
  status: string;
  error_code?: string;
  info?: string;
  timestamp: string;
}

export interface TransactionStartedEvent {
  charge_point_id: string;
  connector_id: number;
  transaction_id: number;
  id_tag: string;
  meter_start: number;
  timestamp: string;
}

export interface TransactionStoppedEvent {
  charge_point_id: string;
  transaction_id: number;
  id_tag: string;
  meter_stop: number;
  energy_consumed_wh: number;
  reason?: string;
  total_cost?: number;
  currency?: string;
  timestamp: string;
}

export interface MeterValuesEvent {
  charge_point_id: string;
  connector_id: number;
  transaction_id?: number;
  values: { value: number; unit: string }[];
  timestamp: string;
}

export interface AuthorizationResultEvent {
  charge_point_id: string;
  id_tag: string;
  status: string;
}

export interface ErrorEvent {
  charge_point_id: string;
  message: string;
}

// ============================================
// Health Check
// ============================================

export interface HealthResponse {
  status: string;
  version: string;
  uptime_seconds: number;
}
