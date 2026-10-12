import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Key,
  AlertTriangle,
  Check,
  Loader2,
  Search,
  Plus,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/stores/use-auth-store';
import { usePermissionsQuery, useCreateRoleMutation } from '../hooks/use-roles';

export default function CreateRolePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const userPriority =
    user?.priority ??
    (user?.roles?.includes('superadmin') ? 100 : user?.roles?.includes('admin') ? 90 : 10);
  const maxAllowedPriority = Math.max(1, userPriority - 1);

  const { data: systemPermissions = [], isLoading: isLoadingPerms } = usePermissionsQuery();
  const { mutate: createRole, isPending } = useCreateRoleMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<number>(Math.min(30, maxAllowedPriority));
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [permissionFilter, setPermissionFilter] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const filteredPermissions = useMemo(() => {
    const q = permissionFilter.trim().toLowerCase();
    if (!q) return systemPermissions;
    return systemPermissions.filter(
      (p) =>
        p.slug.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [systemPermissions, permissionFilter]);

  const togglePermission = (id: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
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
    setValidationError(null);

    const trimmedName = name.trim().toLowerCase();

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

    createRole(
      {
        name: trimmedName,
        description: description.trim(),
        priority,
        permissionIds: selectedPermissionIds,
      },
      {
        onSuccess: () => {
          navigate('/roles');
        },
      },
    );
  };

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
          <h2 className="text-xl font-bold tracking-tight text-foreground m-0 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Crear Nuevo Rol Personalizado</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            <span>
              Configura la identidad, nivel jerárquico de prioridad y asigna los permisos del sistema que compondrán este rol.
            </span>
          </p>
        </div>
      </div>

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
              <span>Nombre canónico del rol y descripción de su función operativa en el sistema.</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="role-name" className="text-xs font-semibold">
                  Identificador del Rol <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="role-name"
                  placeholder="ej: analista_riesgos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-xs font-mono lowercase"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Identificador único en minúsculas sin espacios (ej: soporte_tecnico).
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role-description" className="text-xs font-semibold">
                  Descripción Operativa
                </Label>
                <Input
                  id="role-description"
                  placeholder="Propósito operativo de este rol..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-9 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Resumen de las responsabilidades asociadas a este perfil.
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
                Determina qué nivel de subordinación tiene el rol. Solo los usuarios con una prioridad estrictamente superior podrán administrar o asignar este rol.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="max-w-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="role-priority" className="text-xs font-semibold">
                  Nivel de Prioridad <span className="text-destructive">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Máx. permitido: <strong className="text-primary">{maxAllowedPriority}</strong>
                </span>
              </div>
              <Input
                id="role-priority"
                type="number"
                min={1}
                max={maxAllowedPriority}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="h-9 text-xs font-mono"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Debe ser un número entero entre 1 y {maxAllowedPriority}.
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
                  <span>Selecciona los permisos granulares concedidos a los usuarios que posean este rol.</span>
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
              <Plus className="h-4 w-4" />
            )}
            <span>{isPending ? 'Creando Rol...' : 'Guardar y Crear Rol'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

