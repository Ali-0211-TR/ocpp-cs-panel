import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { sessionApi } from '@entities/session';
import type { LoginRequest } from '@entities/session';
import { useAuthStore } from '../model/auth.store';
import { Button, Input } from '@shared/ui';
import toast from 'react-hot-toast';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => sessionApi.login(data),
    onSuccess: (data) => {
      if (!data.access_token) {
        toast.error('Login failed: no token received');
        console.error('[auth] login response missing access_token:', data);
        return;
      }
      setAuth(data.access_token, data.user);
      toast.success('Logged in successfully');
      navigate('/', { replace: true });
    },
    onError: () => {
      toast.error('Invalid credentials');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <Input
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        autoComplete="username"
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />
      <Button type="submit" className="w-full" loading={loginMutation.isPending}>
        Sign In
      </Button>
    </form>
  );
}
