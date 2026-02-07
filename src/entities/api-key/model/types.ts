export interface ApiKeyResponse {
  id: number;
  key_prefix: string;
  name: string;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateApiKeyRequest {
  name: string;
  expires_in_days?: number | null;
  description?: string | null;
}

export interface CreatedApiKeyResponse {
  api_key: ApiKeyResponse;
  full_key: string;
}
