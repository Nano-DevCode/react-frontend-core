import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Table as TableIcon, RefreshCw, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { useUrlPagination } from '@/hooks/use-url-pagination';
import { UsersTable } from '../components/general/UsersTable';
import { MobileUserCards } from '../components/general/MobileUserCards';
import { useUsersQuery } from '../hooks/use-users';
import { useUIStore } from '@/stores/use-ui-store';
import type { UserRecord } from '../types/users.types';

export default function UsersPage() {
  const navigate = useNavigate();
  const { page, limit } = useUrlPagination({ defaultLimit: 10 });
  const { data: apiUsers, isLoading, isFetching, refetch } = useUsersQuery({
    page,
    limit,
    status: 'all',
  });
  const { usersViewMode, setUsersViewMode } = useUIStore();

  const users: UserRecord[] = Array.isArray(apiUsers?.users)
    ? apiUsers.users
    : [];

  const totalPages = apiUsers?.totalPages ?? 1;
  const total = apiUsers?.total ?? users.length;

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
            disabled={isFetching}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/usuarios/crear')}
            className="h-9 gap-1.5 text-xs font-semibold shadow-xs"
          >
            <UserPlus className="h-4 w-4" />
            <span>Nuevo Usuario</span>
          </Button>
        </div>
      </div>

      {/* Contenido según vista y resolución con transición suave de fetching */}
      <div className={`space-y-4 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
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

        {/* Paginación universal sincronizada con la URL */}
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <PaginationBar
            totalPages={totalPages}
            totalRecords={total}
            pageSizeOptions={[5, 10, 20, 50]}
            isLoading={isFetching}
          />
        </div>
      </div>
    </div>
  );
}

