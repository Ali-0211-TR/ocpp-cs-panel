/** Generic API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
}

/** Paginated response */
export interface PaginatedResponse<T = unknown> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/** Pagination params for queries */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** Typed API error */
export class ApiError extends Error {
  status: number;
  details?: string;

  constructor(status: number, message: string, details?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}
