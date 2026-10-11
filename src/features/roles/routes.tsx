import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RoleGuard } from '@/router/guards';
import { BentoGridSkeleton } from '@/components/shared/BentoGridSkeleton';
import { lazyWithRetry } from '@/router/lazy-retry';

const RolesPage = lazyWithRetry(() => import('./components/RolesPage'));

export const rolesRoutes: RouteObject[] = [
  {
    path: 'roles',
    element: (
      <RoleGuard allowedRoles={['admin', 'superadmin']}>
        <Suspense fallback={<BentoGridSkeleton />}>
          <RolesPage />
        </Suspense>
      </RoleGuard>
    ),
  },
];

