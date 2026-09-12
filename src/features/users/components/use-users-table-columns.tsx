import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit3, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserStatusSwitch } from './UserStatusSwitch';
import type { UserRecord } from '@/types/users.types';

interface UseUsersTableColumnsProps {
  onEditUser: (user: UserRecord) => void;
}

export const useUsersTableColumns = ({ onEditUser }: UseUsersTableColumnsProps) => {
  const columns = useMemo<ColumnDef<UserRecord>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-3 h-8 text-xs font-semibold"
          >
            <span>Usuario</span>
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => {
          const user = row.original;
          const initials = (user.name?.[0] || user.email[0] || 'U').toUpperCase();
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  <span>{initials}</span>
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground text-xs">
                  <span>{user.name || 'Sin nombre'}</span>
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  <span>ID: {user.id.substring(0, 8)}...</span>
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'email',
        header: 'Correo Electrónico',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-mono text-xs text-foreground">
            <span>{row.original.email}</span>
            {row.original.twoFactor?.isEnabled && (
              <span title="2FA Habilitado">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              </span>
            )}
          </div>
        ),
      },
      {
        id: 'roles',
        header: 'Roles Asignados',
        cell: ({ row }) => {
          const roles = row.original.roles || [];
          return (
            <div className="flex flex-wrap gap-1">
              {roles.map((r, i) => {
                const name = r.role.name;
                return (
                  <Badge
                    key={i}
                    variant={name === 'admin' ? 'admin' : name === 'user' ? 'user' : 'outline'}
                    className="text-[10px] py-0 px-2 font-medium"
                  >
                    <span>{name}</span>
                  </Badge>
                );
              })}
            </div>
          );
        },
      },
      {
        id: 'permissions',
        header: 'Permisos Heredados',
        cell: ({ row }) => {
          const perms: string[] = Array.from(
            new Set(
              row.original.roles?.flatMap((r) =>
                r.role.permissions?.map((p) => p.permission.slug) || []
              ) || []
            )
          );
          if (perms.length === 0) {
            return (
              <span className="text-xs text-muted-foreground italic">
                <span>files.read</span>
              </span>
            );
          }
          return (
            <div className="flex flex-wrap gap-1 max-w-[200px]">
              {perms.slice(0, 2).map((p) => (
                <span
                  key={p}
                  className="rounded-sm bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                >
                  <span>{p}</span>
                </span>
              ))}
              {perms.length > 2 && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  <span>+{perms.length - 2}</span>
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Estado',
        cell: ({ row }) => (
          <UserStatusSwitch
            userId={row.original.id}
            isActive={row.original.isActive}
          />
        ),
      },
      {
        id: 'actions',
        header: 'Acción',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditUser(row.original)}
            className="h-8 gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/10"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Editar</span>
          </Button>
        ),
      },
    ],
    [onEditUser]
  );

  return columns;
};

