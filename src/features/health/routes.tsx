import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { BentoGridSkeleton } from '@/components/shared/BentoGridSkeleton';
import { lazyWithRetry } from '@/router/lazy-retry';

const HealthDashboardPage = lazyWithRetry(() => import('./components/HealthDashboardPage'));

export const healthRoutes: RouteObject[] = [
  {
    path: 'salud',
    element: (
      <Suspense fallback={<BentoGridSkeleton />}>
        <HealthDashboardPage />
      </Suspense>
    ),
  },
];

