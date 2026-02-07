import axios from 'axios';
import { ENV } from '@shared/config/env';
import { ApiError } from './types';

export const apiInstance = axios.create({
  baseURL: `${ENV.API_URL}${ENV.API_PREFIX}`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

// ── Request interceptor: attach Bearer token ──
apiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Lazily import auth store to avoid circular deps.
 * Called only on 401 to clear session via Zustand (which triggers ProtectedRoute redirect).
 */
let _logoutFn: (() => void) | null = null;
async function getLogout() {
  if (!_logoutFn) {
    const { useAuthStore } = await import('@features/auth/model/auth.store');
    _logoutFn = useAuthStore.getState().logout;
  }
  return _logoutFn;
}

// ── Response interceptor: unwrap ApiResponse & handle 401 ──
apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const message =
        error.response?.data?.error ??
        error.response?.statusText ??
        error.message;

      // 401 on non-auth endpoints → session expired, clear auth state
      const url = error.config?.url ?? '';
      if (status === 401 && !url.startsWith('/auth/')) {
        const logout = await getLogout();
        logout();
      }

      return Promise.reject(new ApiError(status, message));
    }
    return Promise.reject(error);
  },
);
