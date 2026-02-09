import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { ScrollArea } from '@shared/ui';
import { PageLoading } from '@shared/ui';
import { useWebSocket } from '@features/websocket';
import { useAuthStore } from '@entities/auth';
import { authApi } from '@entities/auth';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated, isLoading, token, setUser, setLoading, logout } = useAuthStore();
  const location = useLocation();

  // Connect to WebSocket only when authenticated
  useWebSocket({ enabled: isAuthenticated && !isLoading });

  // Fetch current user on mount if authenticated
  useEffect(() => {
    const fetchUser = async () => {
      if (token && isAuthenticated) {
        try {
          const user = await authApi.me();
          setUser(user);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          // If user not found (e.g. DB was reset), clear stale auth state
          logout();
          return;
        }
      }
      setLoading(false);
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loading while checking auth
  if (isLoading) {
    return <PageLoading />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onCollapsedChange={setSidebarCollapsed} 
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <ScrollArea className="flex-1">
          <main className="p-6">
            <Outlet />
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
