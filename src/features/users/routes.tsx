import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RoleGuard } from '@/router/guards';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { lazyWithRetry } from '@/router/lazy-retry';

const UsersPage = lazyWithRetry(() => import('./pages/UsersPage'));
const CreateUserPage = lazyWithRetry(() => import('./pages/CreateUserPage'));
const UserDetailsPage = lazyWithRetry(() => import('./pages/UserDetailsPage'));
const EditUserPage = lazyWithRetry(() => import('./pages/EditUserPage'));

export const usersRoutes: RouteObject[] = [
  {
    path: 'usuarios',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <Suspense fallback={<TableSkeleton rows={8} columns={6} />}>
          <UsersPage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: 'usuarios/crear',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <Suspense fallback={<TableSkeleton rows={6} columns={4} />}>
          <CreateUserPage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: 'usuarios/nuevo',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <Suspense fallback={<TableSkeleton rows={6} columns={4} />}>
          <CreateUserPage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: 'usuarios/:id',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <Suspense fallback={<TableSkeleton rows={6} columns={4} />}>
          <UserDetailsPage />
        </Suspense>
      </RoleGuard>
    ),
  },
  {
    path: 'usuarios/:id/editar',
    element: (
      <RoleGuard allowedRoles={['admin']}>
        <Suspense fallback={<TableSkeleton rows={6} columns={4} />}>
          <EditUserPage />
        </Suspense>
      </RoleGuard>
    ),
  },
];

