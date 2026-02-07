// ── Charge Point entity types (from OpenAPI schemas) ──

export interface ConnectorDto {
  id: number;
  status: string;
  error_code: string | null;
  error_info: string | null;
}

export interface ChargePointDto {
  id: string;
  status: string;
  is_online: boolean;
  connectors: ConnectorDto[];
  registered_at: string;
  last_heartbeat: string | null;
  vendor: string | null;
  model: string | null;
  serial_number: string | null;
  firmware_version: string | null;
  iccid: string | null;
  imsi: string | null;
}

export interface ChargePointStats {
  total: number;
  online: number;
  offline: number;
  charging: number;
}

// ── Command types ──

export interface ChangeAvailabilityRequest {
  connector_id: number;
  type: 'Operative' | 'Inoperative';
}

export interface RemoteStartRequest {
  id_tag: string;
  connector_id?: number | null;
}

export interface RemoteStopRequest {
  transaction_id: number;
}

export interface ResetRequest {
  type: 'Soft' | 'Hard';
}

export interface TriggerMessageRequest {
  message: string;
  connector_id?: number | null;
}

export interface UnlockConnectorRequest {
  connector_id: number;
}

export interface CommandResponse {
  status: string;
  message: string | null;
}

export interface ConfigValue {
  key: string;
  readonly: boolean;
  value: string | null;
}

export interface ConfigurationResponse {
  configuration: ConfigValue[];
  unknown_keys: string[];
}
