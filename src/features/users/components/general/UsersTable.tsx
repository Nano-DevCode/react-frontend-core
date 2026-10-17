import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  flexRender,
} from '@tanstack/react-table';
import { toast } from 'sonner';
import { useUsersTableColumns } from './use-users-table-columns';
import { UsersTableToolbar } from './UsersTableToolbar';
import { EmptyState } from '@/components/shared/EmptyState';
import { UserLifecycleDialog } from '../crud/UserLifecycleDialog';
import { useExportUsersMutation } from '../../hooks/use-users';
import type { UserRecord } from '../../types/users.types';

interface UsersTableProps {
  users: UserRecord[];
}

export const UsersTable = ({ users }: UsersTableProps) => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [lifecycleUser, setLifecycleUser] = useState<UserRecord | null>(null);

  const { mutate: exportUsers, isPending: isExporting } = useExportUsersMutation();

  // Filtrado compuesto defensivo
  const filteredUsers = useMemo(() => {
    const safeUsers = Array.isArray(users) ? users : [];

    return safeUsers.filter((u) => {
      const matchRole =
        roleFilter === 'ALL' ||
        u.roles?.some((r) => r.role.name.toLowerCase() === roleFilter.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && u.isActive && !u.deletedAt) ||
        (statusFilter === 'SUSPENDED' && !u.isActive && !u.deletedAt) ||
        (statusFilter === 'DELETED' && Boolean(u.deletedAt));

      const matchSearch =
        !globalFilter ||
        u.email.toLowerCase().includes(globalFilter.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(globalFilter.toLowerCase()));

      return matchRole && matchStatus && matchSearch;
    });
  }, [users, roleFilter, statusFilter, globalFilter]);

  const columns = useUsersTableColumns({
    onViewDetails: (user) => navigate(`/usuarios/${user.id}`),
    onEditUser: (user) => navigate(`/usuarios/${user.id}/editar`),
    onToggleLifecycle: setLifecycleUser,
  });

  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const { rows } = table.getRowModel();

  const handleExportCSV = () => {
    exportUsers(undefined, {
      onSuccess: (res) => {
        const headers = 'ID,Nombre,Email,Activo,Roles\n';
        const rowsCsv = filteredUsers
          .map(
            (u) =>
              `"${u.id}","${u.name || ''}","${u.email}",${u.isActive},"${u.roles?.map((r) => r.role.name).join(';') || ''}"`
          )
          .join('\n');
        const blob = new Blob([headers + rowsCsv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `usuarios_export_${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success(res.message || 'Archivo CSV generado exitosamente');
      },
    });
  };

  return (
    <div className="notranslate space-y-4">
      {/* Controles y Filtros */}
      <UsersTableToolbar
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onExportCSV={handleExportCSV}
        isExporting={isExporting}
      />

      {/* Tabla Paginada sin Scroll Vertical Interno */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
        <div className="relative w-full overflow-x-auto no-scrollbar">
          <table className="w-full caption-bottom text-sm border-collapse">
            <thead className="bg-muted/60 border-b border-border/60">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-11 px-4 text-left align-middle text-xs font-semibold text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/30">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-8">
                    <EmptyState
                      title="Sin usuarios coincidentes"
                      description="No se encontraron usuarios que coincidan con la búsqueda o filtros aplicados."
                    />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-muted/40 h-14"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2.5 align-middle text-xs">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>
          <span>Total mostrado en página:</span> <strong><span>{filteredUsers.length}</span></strong> <span>de</span> <strong><span>{users.length}</span></strong> <span>usuarios</span>
        </span>
        <span className="text-[11px] font-mono">
          <span>TanStack Table v8 + TanStack Query</span>
        </span>
      </div>

      {/* Modal de Confirmación de Baja / Alta */}
      <UserLifecycleDialog
        user={lifecycleUser}
        open={Boolean(lifecycleUser)}
        onOpenChange={(open) => !open && setLifecycleUser(null)}
      />
    </div>
  );
};

