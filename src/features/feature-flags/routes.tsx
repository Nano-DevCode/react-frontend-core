import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RoleGuard } from '@/router/guards';
import { BentoGridSkeleton } from '@/components/shared/BentoGridSkeleton';
import { lazyWithRetry } from '@/router/lazy-retry';

const FeatureFlagsPage = lazyWithRetry(() => import('./components/FeatureFlagsPage'));

export const featureFlagsRoutes: RouteObject[] = [
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
];

