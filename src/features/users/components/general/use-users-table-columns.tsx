import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown,
  Edit3,
  ShieldCheck,
  MoreHorizontal,
  Eye,
  UserX,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { UserRecord } from '../../types/users.types';

interface UseUsersTableColumnsProps {
  onViewDetails: (user: UserRecord) => void;
  onEditUser: (user: UserRecord) => void;
  onToggleLifecycle: (user: UserRecord) => void;
}

export const useUsersTableColumns = ({
  onViewDetails,
  onEditUser,
  onToggleLifecycle,
}: UseUsersTableColumnsProps) => {
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
          const isDeleted = Boolean(user.deletedAt);

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  <span>{initials}</span>
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground text-xs">
                    <span>{user.name || 'Sin nombre'}</span>
                  </span>
                  {isDeleted && (
                    <Badge variant="destructive" className="text-[9px] py-0 px-1.5 h-4">
                      <span>Baja</span>
                    </Badge>
                  )}
                </div>
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
                    variant={
                      name === 'superadmin'
                        ? 'destructive'
                        : name === 'admin'
                        ? 'admin'
                        : name === 'user'
                        ? 'user'
                        : 'outline'
                    }
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
        accessorKey: 'isActive',
        header: 'Estado',
        cell: ({ row }) => {
          const user = row.original;
          if (user.deletedAt) {
            return (
              <Badge variant="destructive" className="text-[10px] py-0 px-2 font-medium">
                <span>En Papelera</span>
              </Badge>
            );
          }
          if (user.isActive) {
            return (
              <Badge
                variant="default"
                className="bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] py-0 px-2 font-medium"
              >
                <span>Activo</span>
              </Badge>
            );
          }
          return (
            <Badge variant="secondary" className="text-[10px] py-0 px-2 font-medium">
              <span>Suspendido</span>
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
          const user = row.original;
          const isDeleted = Boolean(user.deletedAt);

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Acciones de usuario"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs">
                <DropdownMenuItem
                  onClick={() => onViewDetails(user)}
                  className="cursor-pointer gap-2"
                >
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  <span>Ver detalles</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onEditUser(user)}
                  className="cursor-pointer gap-2"
                >
                  <Edit3 className="h-3.5 w-3.5 text-blue-500" />
                  <span>Editar usuario</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {isDeleted ? (
                  <DropdownMenuItem
                    onClick={() => onToggleLifecycle(user)}
                    className="cursor-pointer gap-2 text-emerald-600 focus:text-emerald-600 dark:text-emerald-400"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Dar de alta</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => onToggleLifecycle(user)}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    <span>Dar de baja</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onViewDetails, onEditUser, onToggleLifecycle]
  );

  return columns;
};
