import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Key,
  AlertTriangle,
  Check,
  Loader2,
  Search,
  Save,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/stores/use-auth-store';
import {
  useRoleDetailsQuery,
  usePermissionsQuery,
  useUpdateRoleMutation,
} from '../hooks/use-roles';

export default function EditRolePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const userPriority =
    user?.priority ??
    (user?.roles?.includes('superadmin') ? 100 : user?.roles?.includes('admin') ? 90 : 10);
  const maxAllowedPriority = Math.max(1, userPriority - 1);

  const { data: role, isLoading: isLoadingRole, isError } = useRoleDetailsQuery(id);
  const { data: systemPermissions = [], isLoading: isLoadingPerms } = usePermissionsQuery();
  const { mutate: updateRole, isPending } = useUpdateRoleMutation();

  const isSystemRole = Boolean(role?.isSystem);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<number>(10);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [permissionFilter, setPermissionFilter] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || '');
      setPriority(role.priority);
      setSelectedPermissionIds(role.permissions.map((p) => p.id));
    }
  }, [role]);

  const filteredPermissions = useMemo(() => {
    const q = permissionFilter.trim().toLowerCase();
    if (!q) return systemPermissions;
    return systemPermissions.filter(
      (p) =>
        p.slug.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [systemPermissions, permissionFilter]);

  const togglePermission = (permId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId],
    );
  };

  const selectAllPermissions = () => {
    setSelectedPermissionIds(systemPermissions.map((p) => p.id));
  };

  const deselectAllPermissions = () => {
    setSelectedPermissionIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setValidationError(null);

    const trimmedName = name.trim().toLowerCase();

    if (!isSystemRole) {
      if (!trimmedName) {
        setValidationError('El identificador del rol es obligatorio.');
        return;
      }
      if (!/^[a-z0-9_-]+$/.test(trimmedName)) {
        setValidationError(
          'El nombre solo puede contener letras minúsculas, números, guiones y guiones bajos (ej: analista_riesgos).',
        );
        return;
      }
      if (priority <= 0) {
        setValidationError('La prioridad debe ser un número entero mayor a 0.');
        return;
      }
      if (priority >= userPriority) {
        setValidationError(
          `Regla de Seguridad: No puedes asignar una prioridad (${priority}) igual o mayor a la de tu rol actual (${userPriority}). El valor máximo permitido para ti es ${maxAllowedPriority}.`,
        );
        return;
      }
    }

    updateRole(
      {
        id: role.id,
        dto: {
          ...(!isSystemRole ? { name: trimmedName } : {}),
          description: description.trim(),
          ...(!isSystemRole ? { priority } : {}),
          permissionIds: selectedPermissionIds,
        },
      },
      {
        onSuccess: () => {
          navigate('/roles');
        },
      },
    );
  };

  if (isLoadingRole) {
    return (
      <div className="notranslate max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-32 bg-muted/50 rounded-lg animate-pulse" />
        <div className="h-24 bg-muted/40 rounded-2xl animate-pulse" />
        <div className="h-64 bg-muted/40 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (isError || !role) {
    return (
      <div className="notranslate max-w-xl mx-auto py-12 text-center space-y-4">
        <Shield className="h-12 w-12 text-muted-foreground/40 mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Rol no encontrado</h2>
        <p className="text-xs text-muted-foreground">
          El rol solicitado no existe en la base de datos o fue eliminado recientemente.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate('/roles')}>
          Volver a Roles
        </Button>
      </div>
    );
  }

  return (
    <div className="notranslate max-w-4xl mx-auto space-y-6">
      {/* Botón Volver */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/roles')}
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a Roles</span>
        </Button>
      </div>

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground m-0 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Editar Rol: {role.name}</span>
            </h2>
            {isSystemRole ? (
              <Badge variant="admin" className="text-xs gap-1">
                <Lock className="h-3 w-3" />
                <span>Sistema</span>
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                <span>Personalizado</span>
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <span>
              Modifica la descripción y reconfigura la matriz de permisos otorgada a los usuarios con este rol.
            </span>
          </p>
        </div>
      </div>

      {/* Alerta de Rol del Sistema */}
      {isSystemRole && (
        <div className="p-3.5 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 rounded-xl flex items-center gap-2.5 shadow-2xs">
          <Shield className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            Este es un <strong>Rol Base del Sistema</strong> ({role.name}). Su identificador y nivel de prioridad ({role.priority}) son inmutables por diseño de seguridad, pero puedes actualizar su descripción y matriz de permisos.
          </span>
        </div>
      )}

      {/* Alerta de Error de Validación */}
      {validationError && (
        <div className="p-3.5 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-start gap-2.5 shadow-2xs">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identidad del Rol */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Identidad del Rol</span>
            </CardTitle>
            <CardDescription className="text-xs">
              <span>Nombre canónico del rol y descripción de su función operativa.</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-role-name" className="text-xs font-semibold">
                  Identificador del Rol <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-role-name"
                  placeholder="ej: analista_riesgos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSystemRole}
                  className="h-9 text-xs font-mono lowercase disabled:opacity-70 disabled:bg-muted"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  {isSystemRole
                    ? 'Protegido contra cambios de nombre.'
                    : 'Nombre único en minúsculas sin espacios.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-role-description" className="text-xs font-semibold">
                  Descripción Operativa
                </Label>
                <Input
                  id="edit-role-description"
                  placeholder="Propósito operativo de este rol..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-9 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Resumen de las responsabilidades asignadas a este perfil.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jerarquía de Seguridad */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Jerarquía de Seguridad (Prioridad)</span>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                Tu prioridad: <strong>{userPriority}</strong>
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              <span>
                Nivel de jerarquía del rol en el sistema. Los roles de mayor prioridad pueden subordinar a roles menores.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="max-w-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-role-priority" className="text-xs font-semibold">
                  Nivel de Prioridad <span className="text-destructive">*</span>
                </Label>
                {!isSystemRole && (
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Máx. permitido: <strong className="text-primary">{maxAllowedPriority}</strong>
                  </span>
                )}
              </div>
              <Input
                id="edit-role-priority"
                type="number"
                min={1}
                max={maxAllowedPriority}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                disabled={isSystemRole}
                className="h-9 text-xs font-mono disabled:opacity-70 disabled:bg-muted"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                {isSystemRole
                  ? 'La jerarquía de los roles del sistema es fija.'
                  : `Debe ser un número entero entre 1 y ${maxAllowedPriority}.`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Matriz de Permisos */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  <span>Matriz de Permisos</span>
                  <Badge variant="secondary" className="text-xs font-mono ml-1">
                    {selectedPermissionIds.length} de {systemPermissions.length} seleccionados
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  <span>Selecciona los permisos granulares concedidos a este rol.</span>
                </CardDescription>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAllPermissions}
                  className="h-8 text-xs"
                >
                  Marcar Todos
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={deselectAllPermissions}
                  className="h-8 text-xs text-muted-foreground"
                >
                  Desmarcar
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {/* Buscador de Permisos */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Filtrar permisos por slug o descripción..."
                value={permissionFilter}
                onChange={(e) => setPermissionFilter(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {isLoadingPerms ? (
              <div className="py-12 flex justify-center items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Cargando catálogo de permisos del sistema...</span>
              </div>
            ) : filteredPermissions.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                <span>No se encontraron permisos que coincidan con el filtro.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredPermissions.map((perm) => {
                  const isChecked = selectedPermissionIds.includes(perm.id);
                  return (
                    <div
                      key={perm.id}
                      onClick={() => togglePermission(perm.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 select-none ${
                        isChecked
                          ? 'border-primary/60 bg-primary/5 shadow-2xs'
                          : 'border-border/60 hover:bg-muted/40 hover:border-border'
                      }`}
                    >
                      <div
                        className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-muted-foreground/30'
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground truncate">
                            {perm.slug}
                          </span>
                        </div>
                        {perm.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {perm.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/roles')}
            disabled={isPending}
            className="h-10 px-5 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="h-10 px-6 gap-2 text-xs font-semibold shadow-xs"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isPending ? 'Guardando Cambios...' : 'Guardar Cambios'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
