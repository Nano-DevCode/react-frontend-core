import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RoleGuard } from '@/router/guards';
import { BentoGridSkeleton } from '@/components/shared/BentoGridSkeleton';
import { lazyWithRetry } from '@/router/lazy-retry';

const HealthDashboardPage = lazyWithRetry(() => import('./components/HealthDashboardPage'));

export const healthRoutes: RouteObject[] = [
  {
    path: 'salud',
    element: (
      <RoleGuard allowedRoles={['admin', 'auditor']}>
        <Suspense fallback={<BentoGridSkeleton />}>
          <HealthDashboardPage />
        </Suspense>
      </RoleGuard>
    ),
  },
];
