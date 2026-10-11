import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { BentoGridSkeleton } from '@/components/shared/BentoGridSkeleton';
import { lazyWithRetry } from '@/router/lazy-retry';

const TwoFactorSetupPage = lazyWithRetry(() => import('./components/TwoFactorSetupPage'));

export const twoFactorRoutes: RouteObject[] = [
  {
    path: 'seguridad-2fa',
    element: (
      <Suspense fallback={<BentoGridSkeleton />}>
        <TwoFactorSetupPage />
      </Suspense>
    ),
  },
];

