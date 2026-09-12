import { LayoutGrid, Table as TableIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { UsersTable } from './UsersTable';
import { MobileUserCards } from './MobileUserCards';
import { useUsersQuery } from '../hooks/use-users';
import { useUIStore } from '@/stores/use-ui-store';
import type { UserRecord } from '@/types/users.types';

// Deterministic mock users for fallback if API is not yet seeded
const FALLBACK_USERS: UserRecord[] = [
  {
    id: 'f1e2d3c4-b5a6-7890-1234-56789abcdef0',
    email: 'admin@empresa.com',
    name: 'Administrador Principal',
    isActive: true,
    emailVerifiedAt: '2026-09-01T10:00:00.000Z',
    deletedAt: null,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-10T14:30:00.000Z',
    roles: [
      {
        role: {
          name: 'admin',
          permissions: [
            { permission: { slug: 'users:*' } },
            { permission: { slug: 'files:*' } },
            { permission: { slug: 'audit:*' } },
            { permission: { slug: 'users:export' } },
          ],
        },
      },
    ],
    twoFactor: { isEnabled: true },
  },
  {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    email: 'carlos.silva@empresa.com',
    name: 'Carlos Silva',
    isActive: true,
    emailVerifiedAt: '2026-09-02T12:00:00.000Z',
    deletedAt: null,
    createdAt: '2026-09-02T12:00:00.000Z',
    updatedAt: '2026-09-08T15:20:00.000Z',
    roles: [
      {
        role: {
          name: 'user',
          permissions: [
            { permission: { slug: 'files.read' } },
            { permission: { slug: 'files.upload' } },
          ],
        },
      },
    ],
    twoFactor: { isEnabled: false },
  },
  {
    id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    email: 'marta.lopez@empresa.com',
    name: 'Marta López',
    isActive: false,
    emailVerifiedAt: '2026-09-05T09:15:00.000Z',
    deletedAt: null,
    createdAt: '2026-09-05T09:15:00.000Z',
    updatedAt: '2026-09-09T11:45:00.000Z',
    roles: [
      {
        role: {
          name: 'user',
          permissions: [{ permission: { slug: 'files.read' } }],
        },
      },
    ],
    twoFactor: { isEnabled: false },
  },
  {
    id: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    email: 'auditor.seguridad@empresa.com',
    name: 'Roberto Gómez (Auditor)',
    isActive: true,
    emailVerifiedAt: '2026-09-03T16:20:00.000Z',
    deletedAt: null,
    createdAt: '2026-09-03T16:20:00.000Z',
    updatedAt: '2026-09-10T12:00:00.000Z',
    roles: [
      {
        role: {
          name: 'auditor',
          permissions: [
            { permission: { slug: 'audit.read' } },
            { permission: { slug: 'users:export' } },
          ],
        },
      },
    ],
    twoFactor: { isEnabled: true },
  },
];

export default function UsersPage() {
  const { data: apiUsers, isLoading, refetch } = useUsersQuery();
  const { usersViewMode, setUsersViewMode } = useUIStore();

  const users: UserRecord[] =
    apiUsers && apiUsers.length > 0 ? apiUsers : FALLBACK_USERS;

  if (isLoading) {
    return <TableSkeleton rows={8} columns={6} />;
  }

  return (
    <div className="notranslate space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground m-0">
              <span>Directorio de Usuarios y Control RBAC</span>
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <span>Administra las identidades, asignación granular de roles y estatus de cuentas en tiempo real.</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch Table / Cards */}
          <div className="hidden sm:flex items-center rounded-lg border border-border/70 p-0.5 bg-muted/30">
            <Button
              variant={usersViewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setUsersViewMode('table')}
              className="h-8 px-2.5 text-xs"
              title="Vista de Tabla"
            >
              <TableIcon className="h-3.5 w-3.5 mr-1" />
              <span>Tabla</span>
            </Button>
            <Button
              variant={usersViewMode === 'cards' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setUsersViewMode('cards')}
              className="h-8 px-2.5 text-xs"
              title="Vista de Tarjetas"
            >
              <LayoutGrid className="h-3.5 w-3.5 mr-1" />
              <span>Cards</span>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refrescar</span>
          </Button>
        </div>
      </div>

      {/* Contenido según vista y resolución */}
      <div className="hidden lg:block">
        {usersViewMode === 'table' ? (
          <UsersTable users={users} />
        ) : (
          <MobileUserCards users={users} />
        )}
      </div>

      {/* En pantallas móviles se muestra MobileUserCards */}
      <div className="block lg:hidden">
        <MobileUserCards users={users} />
      </div>
    </div>
  );
}

