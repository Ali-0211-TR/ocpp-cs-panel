import { Navigate } from 'react-router-dom';
import { LoginForm, useAuthStore } from '@features/auth';
import { Zap } from 'lucide-react';

export function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <Zap className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">OCPP Central System</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to manage your charge points</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
