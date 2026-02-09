import { api } from '@shared/api';
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  ChangePasswordRequest,
  UserInfo 
} from '@shared/api';

const AUTH_BASE = '/auth';

export const authApi = {
  login: (data: LoginRequest) => 
    api.post<LoginResponse>(`${AUTH_BASE}/login`, data),

  register: (data: RegisterRequest) => 
    api.post<UserInfo>(`${AUTH_BASE}/register`, data),

  me: () => 
    api.get<UserInfo>(`${AUTH_BASE}/me`),

  changePassword: (data: ChangePasswordRequest) => 
    api.put<void>(`${AUTH_BASE}/change-password`, data),
};
