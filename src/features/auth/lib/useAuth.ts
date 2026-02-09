import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi, useAuthStore } from '@entities/auth';
import type { LoginRequest, ChangePasswordRequest } from '@shared/api';
import { toast } from '@shared/ui';

export function useLogin() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      setAuth(response.token, response.user);
      toast('Успешный вход');
      navigate('/');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка входа: ${error.message}`);
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return () => {
    logout();
    queryClient.clear();
    navigate('/login');
    toast('Вы вышли из системы');
  };
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
    onSuccess: () => {
      toast('Пароль успешно изменён');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
}

export function useCurrentUser() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, checkAuth } = useAuthStore();

  const fetchCurrentUser = async () => {
    if (!checkAuth()) {
      setLoading(false);
      return null;
    }

    try {
      const userData = await authApi.me();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    fetchCurrentUser,
  };
}

export function useUser() {
  const { user } = useAuthStore();
  return user;
}
