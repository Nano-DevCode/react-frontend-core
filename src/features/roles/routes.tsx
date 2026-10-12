import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RoleGuard } from '@/router/guards';
import { BentoGridSkeleton } from '@/components/shared/BentoGridSkeleton';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { lazyWithRetry } from '@/router/lazy-retry';

const RolesPage = lazyWithRetry(() => import('./components/RolesPage'));
const CreateRolePage = lazyWithRetry(() => import('./pages/CreateRolePage'));
const EditRolePage = lazyWithRetry(() => import('./pages/EditRolePage'));

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
  {
    path: 'roles/crear',
    element: (
      <RoleGuard allowedRoles={['admin', 'superadmin']}>
        <Suspense fallback={<TableSkeleton rows={6} columns={4} />}>
          <CreateRolePage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: 'roles/nuevo',
    element: (
      <RoleGuard allowedRoles={['admin', 'superadmin']}>
        <Suspense fallback={<TableSkeleton rows={6} columns={4} />}>
          <CreateRolePage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: 'roles/:id/editar',
    element: (
      <RoleGuard allowedRoles={['admin', 'superadmin']}>
        <Suspense fallback={<TableSkeleton rows={6} columns={4} />}>
          <EditRolePage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: 'roles/editar/:id',
    element: (
      <RoleGuard allowedRoles={['admin', 'superadmin']}>
        <Suspense fallback={<TableSkeleton rows={6} columns={4} />}>
          <EditRolePage />
        </Suspense>
      </RoleGuard>
    ),
  },
];
