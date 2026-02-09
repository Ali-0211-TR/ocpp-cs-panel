import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '@features/auth';
import { useAuthStore } from '@entities/auth';
import { useEffect } from 'react';
import { Zap } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            OCPP Central System
          </h1>
          <p className="text-muted-foreground mt-2">
            Панель управления зарядными станциями
          </p>
        </div>

        {/* Login Form */}
        <LoginForm onSuccess={() => navigate(from, { replace: true })} />

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} OCPP CS. Все права защищены.
        </p>
      </div>
    </div>
  );
}
