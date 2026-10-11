import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RoleGuard } from '@/router/guards';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { lazyWithRetry } from '@/router/lazy-retry';

const S3FilesPage = lazyWithRetry(() => import('./components/S3FilesPage'));

export const filesRoutes: RouteObject[] = [
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
];

