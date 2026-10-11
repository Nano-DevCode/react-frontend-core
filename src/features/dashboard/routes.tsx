import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { BentoGridSkeleton } from '@/components/shared/BentoGridSkeleton';
import { lazyWithRetry } from '@/router/lazy-retry';

const DashboardOverviewPage = lazyWithRetry(() => import('./components/DashboardOverviewPage'));

export const dashboardRoutes: RouteObject[] = [
  {
    index: true,
    element: (
      <Suspense fallback={<BentoGridSkeleton />}>
        <DashboardOverviewPage />
      </Suspense>
    ),
  },
];

