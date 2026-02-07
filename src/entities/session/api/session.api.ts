import { apiInstance } from '@shared/api';
import type { ApiResponse } from '@shared/api';
import type { UserInfo, LoginRequest, LoginResponse, RegisterRequest, ChangePasswordRequest } from '../model/types';

/**
 * Unwrap an API response that might be wrapped in ApiResponse<T> or returned directly.
 * Handles both `{ success, data, error }` and plain `T` response shapes.
 */
function unwrap<T>(body: ApiResponse<T> | T): T {
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    return (body as ApiResponse<T>).data as T;
  }
  return body as T;
}

/**
 * Extract login payload from a potentially variable response shape.
 * Tries common token field names: access_token, token, accessToken.
 */
function extractLogin(raw: unknown): LoginResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = raw as Record<string, any>;
  console.debug('[auth] raw login response:', obj);

  const token: string | undefined =
    obj?.access_token ?? obj?.token ?? obj?.accessToken;

  if (!token) {
    console.error('[auth] Could not find token in login response. Keys:', Object.keys(obj ?? {}));
    throw new Error('Login response does not contain a token field');
  }

  return {
    access_token: token,
    token_type: obj?.token_type ?? obj?.tokenType ?? 'bearer',
    user: obj?.user ?? { id: 0, username: '', email: '', role: '' },
  };
}

export const sessionApi = {
  login: (data: LoginRequest) =>
    apiInstance.post('/auth/login', data).then((r) => extractLogin(unwrap(r.data))),
  register: (data: RegisterRequest) =>
    apiInstance.post<ApiResponse<UserInfo> | UserInfo>('/auth/register', data).then((r) => unwrap(r.data)),
  me: () =>
    apiInstance.get<ApiResponse<UserInfo> | UserInfo>('/auth/me').then((r) => unwrap(r.data)),
  changePassword: (data: ChangePasswordRequest) =>
    apiInstance.post<ApiResponse<null>>('/auth/change-password', data).then((r) => r.data),
};
