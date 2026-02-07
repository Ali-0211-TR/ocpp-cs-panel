export interface IdTagDto {
  id_tag: string;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  name: string | null;
  expiry_date: string | null;
  parent_id_tag: string | null;
  max_active_transactions: number | null;
  last_used_at: string | null;
  user_id: string | null;
}

export interface CreateIdTagRequest {
  id_tag: string;
  status?: string;
  name?: string | null;
  expiry_date?: string | null;
  parent_id_tag?: string | null;
  max_active_transactions?: number | null;
  user_id?: string | null;
}

export interface UpdateIdTagRequest {
  status?: string | null;
  is_active?: boolean | null;
  name?: string | null;
  expiry_date?: string | null;
  parent_id_tag?: string | null;
  max_active_transactions?: number | null;
  user_id?: string | null;
}
