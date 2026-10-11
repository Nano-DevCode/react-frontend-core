import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ProtectedRoute } from './guards';

// ============================================================================
// Enrutadores Modulares por Dominio (Feature-Driven Architecture)
// ============================================================================
import { authRoutes } from '@/features/auth/routes';
import { dashboardRoutes } from '@/features/dashboard/routes';
import { usersRoutes } from '@/features/users/routes';
import { filesRoutes } from '@/features/files/routes';
import { auditRoutes } from '@/features/audit/routes';
import { healthRoutes } from '@/features/health/routes';
import { twoFactorRoutes } from '@/features/two-factor/routes';
import { featureFlagsRoutes } from '@/features/feature-flags/routes';
import { systemLogsRoutes } from '@/features/system-logs/routes';
import { discordBotRoutes } from '@/features/discord-bot/routes';

export const router = createBrowserRouter([
  // 1. Rutas Públicas de Autenticación
  ...authRoutes,

  // 2. Shell Principal Protegido con Layout Adaptativo y Sub-rutas por Dominio
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      ...dashboardRoutes,
      ...usersRoutes,
      ...filesRoutes,
      ...auditRoutes,
      ...healthRoutes,
      ...twoFactorRoutes,
      ...featureFlagsRoutes,
      ...systemLogsRoutes,
      ...discordBotRoutes,
      {
        path: 'logs',
        element: <Navigate to="/admin/logs" replace />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
