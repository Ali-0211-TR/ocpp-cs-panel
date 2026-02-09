import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@shared/ui';
import { AppLayout } from '@widgets/layout';
import {
  LoginPage,
  DashboardPage,
  ChargePointsPage,
  ChargePointDetailPage,
  TransactionsPage,
  IdTagsPage,
  TariffsPage,
  ApiKeysPage,
  SettingsPage,
  ReportsPage,
  NotFoundPage,
} from '@pages/index';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="charge-points" element={<ChargePointsPage />} />
            <Route path="charge-points/:id" element={<ChargePointDetailPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="id-tags" element={<IdTagsPage />} />
            <Route path="tariffs" element={<TariffsPage />} />
            <Route path="api-keys" element={<ApiKeysPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
