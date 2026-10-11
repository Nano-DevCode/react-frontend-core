import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RoleGuard } from '@/router/guards';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { lazyWithRetry } from '@/router/lazy-retry';

const AuditLogsPage = lazyWithRetry(() => import('./components/AuditLogsPage'));

export const auditRoutes: RouteObject[] = [
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
];

