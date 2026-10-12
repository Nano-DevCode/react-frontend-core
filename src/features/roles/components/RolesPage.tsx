import { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Key,
  Users,
  Edit2,
  Trash2,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { useUrlPagination } from '@/hooks/use-url-pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useRolesQuery, useDeleteRoleMutation } from '../hooks/use-roles';
import { RoleFormDialog } from './RoleFormDialog';
import type { RoleRecord } from '../types/roles.types';
import { cn } from '@/lib/utils';

export default function RolesPage() {
  const { page, limit, setPage, setLimit } = useUrlPagination({
    defaultPage: 1,
    defaultLimit: 8,
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search, setPage]);

  const {
    data: rolesResponse,
    isLoading,
    isFetching,
    refetch,
  } = useRolesQuery({
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
  });

  const roles: RoleRecord[] = rolesResponse?.roles ?? [];
  const totalPages = rolesResponse?.totalPages ?? 1;
  const totalRecords = rolesResponse?.total ?? roles.length;

  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRoleMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleRecord | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleRecord | null>(null);

  const handleOpenCreate = () => {
    setSelectedRole(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (role: RoleRecord) => {
    setSelectedRole(role);
    setDialogOpen(true);
  };

  const handleOpenDelete = (role: RoleRecord) => {
    setRoleToDelete(role);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (roleToDelete) {
      deleteRole(roleToDelete.id, {
        onSuccess: () => {
          setDeleteConfirmOpen(false);
          setRoleToDelete(null);
        },
      });
    }
  };

  return (
    <div className="notranslate space-y-6">
      {/* Encabezado */}
      <PageHeader
        title="Gestión de Roles y Permisos (RBAC)"
        badge={
          <Badge variant="admin" className="text-xs">
            <span>Jerarquía de Seguridad</span>
          </Badge>
        }
        description="Administra los roles del sistema, define niveles de jerarquía y configura la matriz de permisos para cada perfil."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-9 gap-1.5 text-xs"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
              <span>{isFetching ? 'Refrescando...' : 'Actualizar'}</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleOpenCreate}
              className="h-9 gap-1.5 text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Rol</span>
            </Button>
          </div>
        }
      />

      {/* Barra de Filtro */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Filtrar rol por nombre o descripción..."
          />
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          <span>{roles.length} de {totalRecords} roles en esta página (Total: {totalRecords})</span>
        </div>
      </div>

      {/* Grid de Roles */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse bg-muted/40 h-44 rounded-xl" />
          ))}
        </div>
      ) : roles.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Shield className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground">No se encontraron roles</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {search
              ? 'No hay ningún rol que coincida con tu búsqueda actual.'
              : 'Aún no se han configurado roles en la plataforma.'}
          </p>
        </Card>
      ) : (
        <div className={`space-y-4 transition-opacity ${isFetching ? 'opacity-70' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => {
              const isSystem = role.isSystem;
              const hasUsers = role.userCount > 0;
              const canDelete = !isSystem && !hasUsers;

              return (
                <Card
                  key={role.id}
                  className="border-border/80 hover-lift bg-card/90 shadow-sm flex flex-col justify-between"
                >
                  <CardContent className="p-5 space-y-4 flex-1">
                    {/* Top Bar: Icono, Nombre y Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-bold text-foreground truncate">
                              {role.name}
                            </span>
                            {isSystem ? (
                              <Badge variant="admin" className="text-[10px] gap-1">
                                <Lock className="h-2.5 w-2.5" />
                                <span>Sistema</span>
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">
                                <span>Personalizado</span>
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {role.description || 'Sin descripción provista.'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-mono font-bold text-foreground">
                          Prioridad: {role.priority}
                        </span>
                      </div>
                    </div>

                    {/* Estadísticas: Usuarios y Permisos */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/50">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>{role.userCount} usuario(s)</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Key className="h-3.5 w-3.5 text-primary" />
                        <span>{role.permissionCount} permiso(s)</span>
                      </div>
                    </div>

                    {/* Lista de Permisos Asignados (preview) */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Permisos Otorgados:
                      </span>
                      {role.permissions.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground italic">
                          Sin permisos específicos vinculados.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                          {role.permissions.map((perm) => (
                            <span
                              key={perm.id}
                              className="inline-block rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-foreground/80 border border-border/40"
                            >
                              {perm.slug}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Acciones de la Tarjeta */}
                  <div className="px-5 py-3 bg-muted/20 border-t border-border/60 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {isSystem
                        ? 'Rol protegido de fábrica'
                        : hasUsers
                          ? 'En uso por usuarios'
                          : 'Rol libre de dependencias'}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(role)}
                        className="h-8 text-xs gap-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDelete(role)}
                        disabled={!canDelete}
                        title={
                          isSystem
                            ? 'No se pueden eliminar los roles base del sistema'
                            : hasUsers
                              ? 'Reasigna a los usuarios antes de eliminar este rol'
                              : 'Eliminar este rol'
                        }
                        className={cn(
                          'h-8 text-xs gap-1',
                          canDelete
                            ? 'text-destructive hover:bg-destructive/10'
                            : 'opacity-40 cursor-not-allowed',
                        )}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Eliminar</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Paginación universal sincronizada con la URL */}
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <PaginationBar
              totalPages={totalPages}
              totalRecords={totalRecords}
              page={page}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={setLimit}
              pageSizeOptions={[4, 8, 12, 20]}
              isLoading={isFetching}
            />
          </div>
        </div>
      )}

      {/* Modal de Creación / Edición */}
      <RoleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        role={selectedRole}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={`¿Eliminar el rol "${roleToDelete?.name}"?`}
        description="Esta acción eliminará de forma irreversible el rol y todas sus asignaciones de permisos. Esta operación se registrará en el registro de auditoría forense."
        confirmLabel="Sí, Eliminar Rol"
        cancelLabel="Cancelar"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
