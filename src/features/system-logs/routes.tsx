import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RoleGuard } from '@/router/guards';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { lazyWithRetry } from '@/router/lazy-retry';

const SystemLogsPage = lazyWithRetry(() => import('./components/SystemLogsPage'));

export const systemLogsRoutes: RouteObject[] = [
  {
    path: 'admin/logs',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <Suspense fallback={<TableSkeleton rows={8} columns={6} />}>
          <SystemLogsPage />
        </Suspense>
      </RoleGuard>
    ),
  },
];

