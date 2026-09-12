import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { BentoGridSkeleton } from '@/components/shared/BentoGridSkeleton';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ProtectedRoute, RoleGuard, PublicOnlyRoute } from './guards';

// Code-Splitting por Módulo de Negocio (React.lazy)
const LoginPage = lazy(() => import('@/features/auth/components/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/components/RegisterPage'));
const VerifyEmailPage = lazy(() => import('@/features/auth/components/VerifyEmailPage'));
const DashboardOverviewPage = lazy(() => import('@/features/dashboard/components/DashboardOverviewPage'));
const UsersPage = lazy(() => import('@/features/users/components/UsersPage'));
const S3FilesPage = lazy(() => import('@/features/files/components/S3FilesPage'));
const AuditLogsPage = lazy(() => import('@/features/audit/components/AuditLogsPage'));
const HealthDashboardPage = lazy(() => import('@/features/health/components/HealthDashboardPage'));
const TwoFactorSetupPage = lazy(() => import('@/features/two-factor/components/TwoFactorSetupPage'));
const FeatureFlagsPage = lazy(() => import('@/features/feature-flags/components/FeatureFlagsPage'));

export const router = createBrowserRouter([
  // Rutas Públicas de Autenticación
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <Suspense fallback={<div className="h-screen bg-background" />}>
          <LoginPage />
        </Suspense>
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicOnlyRoute>
        <Suspense fallback={<div className="h-screen bg-background" />}>
          <RegisterPage />
        </Suspense>
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <PublicOnlyRoute>
        <Suspense fallback={<div className="h-screen bg-background" />}>
          <VerifyEmailPage />
        </Suspense>
      </PublicOnlyRoute>
    ),
  },

  // Shell Principal Protegido con Layout Adaptativo
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<BentoGridSkeleton />}>
            <DashboardOverviewPage />
          </Suspense>
        ),
      },
      {
        path: 'usuarios',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <Suspense fallback={<TableSkeleton rows={8} columns={6} />}>
              <UsersPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: 'archivos',
        element: (
          <RoleGuard allowedRoles={['admin', 'user']}>
            <Suspense fallback={<TableSkeleton rows={6} columns={5} />}>
              <S3FilesPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: 'auditoria',
        element: (
          <RoleGuard allowedRoles={['admin', 'auditor']}>
            <Suspense fallback={<TableSkeleton rows={8} columns={6} />}>
              <AuditLogsPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: 'salud',
        element: (
          <Suspense fallback={<BentoGridSkeleton />}>
            <HealthDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'seguridad-2fa',
        element: (
          <Suspense fallback={<BentoGridSkeleton />}>
            <TwoFactorSetupPage />
          </Suspense>
        ),
      },
      {
        path: 'feature-flags',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <Suspense fallback={<BentoGridSkeleton />}>
              <FeatureFlagsPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

