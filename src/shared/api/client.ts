import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_V1_URL, TOKEN_KEY } from '@shared/config';
import type { ApiResponse } from './types';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_V1_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Extract error message from response
    const errorMessage = 
      error.response?.data?.error || 
      error.message || 
      'Произошла ошибка при запросе к серверу';

    return Promise.reject(new Error(errorMessage));
  }
);

// Helper function for API requests
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: unknown,
  params?: Record<string, unknown>
): Promise<T> {
  const response = await apiClient.request<ApiResponse<T>>({
    method,
    url,
    data,
    params,
  });

  // Extract data from ApiResponse wrapper
  if (response.data.success && response.data.data !== undefined) {
    return response.data.data;
  }

  // If not wrapped in ApiResponse, return raw data
  return response.data as unknown as T;
}

// Export the axios instance for direct use if needed
export { apiClient };

// API methods
export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) => 
    apiRequest<T>('GET', url, undefined, params),
  
  post: <T>(url: string, data?: unknown) => 
    apiRequest<T>('POST', url, data),
  
  put: <T>(url: string, data?: unknown) => 
    apiRequest<T>('PUT', url, data),
  
  delete: <T>(url: string) => 
    apiRequest<T>('DELETE', url),
};
