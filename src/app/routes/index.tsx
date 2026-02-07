import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@widgets/layout';
import { ProtectedRoute } from './ProtectedRoute';
import { PageSpinner } from '@shared/ui';

const LoginPage = lazy(() => import('@pages/login').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('@pages/dashboard').then((m) => ({ default: m.DashboardPage })));
const ChargePointsPage = lazy(() => import('@pages/charge-points').then((m) => ({ default: m.ChargePointsPage })));
const ChargePointDetailPage = lazy(() => import('@pages/charge-points').then((m) => ({ default: m.ChargePointDetailPage })));
const TransactionsPage = lazy(() => import('@pages/transactions').then((m) => ({ default: m.TransactionsPage })));
const IdTagsPage = lazy(() => import('@pages/id-tags').then((m) => ({ default: m.IdTagsPage })));
const TariffsPage = lazy(() => import('@pages/tariffs').then((m) => ({ default: m.TariffsPage })));
const MonitoringPage = lazy(() => import('@pages/monitoring').then((m) => ({ default: m.MonitoringPage })));
const SettingsPage = lazy(() => import('@pages/settings').then((m) => ({ default: m.SettingsPage })));
const ApiKeysPage = lazy(() => import('@pages/api-keys').then((m) => ({ default: m.ApiKeysPage })));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'charge-points',
        element: (
          <SuspenseWrapper>
            <ChargePointsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'charge-points/:id',
        element: (
          <SuspenseWrapper>
            <ChargePointDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'transactions',
        element: (
          <SuspenseWrapper>
            <TransactionsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'id-tags',
        element: (
          <SuspenseWrapper>
            <IdTagsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'tariffs',
        element: (
          <SuspenseWrapper>
            <TariffsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'monitoring',
        element: (
          <SuspenseWrapper>
            <MonitoringPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'settings',
        element: (
          <SuspenseWrapper>
            <SettingsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'api-keys',
        element: (
          <SuspenseWrapper>
            <ApiKeysPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
