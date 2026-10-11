import { useState, useEffect } from 'react';
import { Shield, Key, AlertTriangle, Check, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/use-auth-store';
import {
  usePermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from '../hooks/use-roles';
import type { RoleRecord } from '../types/roles.types';

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: RoleRecord | null;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
}: RoleFormDialogProps) {
  const isEditing = Boolean(role);
  const isSystemRole = Boolean(role?.isSystem);

  const { user } = useAuthStore();
  const userPriority =
    user?.priority ??
    (user?.roles?.includes('superadmin') ? 100 : user?.roles?.includes('admin') ? 90 : 10);
  const maxAllowedPriority = Math.max(1, userPriority - 1);

  const { data: systemPermissions = [], isLoading: isLoadingPerms } =
    usePermissionsQuery();
  const { mutate: createRole, isPending: isCreating } = useCreateRoleMutation();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRoleMutation();

  const isPending = isCreating || isUpdating;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<number>(10);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || '');
      setPriority(role.priority);
      setSelectedPermissionIds(role.permissions.map((p) => p.id));
    } else {
      setName('');
      setDescription('');
      setPriority(Math.min(30, maxAllowedPriority));
      setSelectedPermissionIds([]);
    }
    setValidationError(null);
  }, [role, open, maxAllowedPriority]);

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

    if (!isEditing && !trimmedName) {
      setValidationError('El nombre del rol es obligatorio.');
      return;
    }

    if (!isEditing && !/^[a-z0-9_-]+$/.test(trimmedName)) {
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
        `Regla de Seguridad: No puedes asignar una prioridad (${priority}) igual o mayor a la de tu rol (${userPriority}). El máximo permitido para ti es ${maxAllowedPriority}.`,
      );
      return;
    }

    if (isEditing && role) {
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
          onSuccess: () => onOpenChange(false),
        },
      );
    } else {
      createRole(
        {
          name: trimmedName,
          description: description.trim(),
          priority,
          permissionIds: selectedPermissionIds,
        },
        {
          onSuccess: () => onOpenChange(false),
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Shield className="h-5 w-5" />
            <DialogTitle>
              {isEditing ? `Editar Rol: ${role?.name}` : 'Crear Nuevo Rol Personalizado'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            {isEditing
              ? 'Modifica las características y la matriz de permisos asignada a este rol.'
              : 'Define la jerarquía de prioridad y selecciona los permisos del sistema que compondrán este rol.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-2 space-y-5">
          {validationError && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {isSystemRole && (
            <div className="p-3 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg flex items-center gap-2">
              <Shield className="h-4 w-4 shrink-0" />
              <span>
                Este es un <strong>Rol Base del Sistema</strong>. Su nombre y nivel de jerarquía son inmutables para garantizar la estabilidad operativa.
              </span>
            </div>
          )}

          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="role-name" className="text-xs font-semibold">
              Identificador del Rol <span className="text-destructive">*</span>
            </Label>
            <Input
              id="role-name"
              placeholder="ej: auditor_externo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isEditing && isSystemRole}
              className="h-9 text-xs font-mono lowercase"
            />
            <p className="text-[11px] text-muted-foreground">
              Nombre único en minúsculas sin espacios.
            </p>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="role-description" className="text-xs font-semibold">
              Descripción del Rol
            </Label>
            <Input
              id="role-description"
              placeholder="Propósito operativo de este rol en la plataforma..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* Prioridad con advertencia de jerarquía */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="role-priority" className="text-xs font-semibold">
                Nivel de Jerarquía (Prioridad) <span className="text-destructive">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground font-mono">
                Máximo permitido: <strong className="text-primary">{maxAllowedPriority}</strong>
              </span>
            </div>
            <Input
              id="role-priority"
              type="number"
              min={1}
              max={maxAllowedPriority}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              disabled={isEditing && isSystemRole}
              className="h-9 text-xs font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Un rol solo puede gestionar usuarios o roles con prioridad estrictamente menor a la suya.
            </p>
          </div>

          {/* Matriz de Permisos */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Key className="h-4 w-4 text-primary" />
                <Label className="text-xs font-semibold">
                  Matriz de Permisos ({selectedPermissionIds.length} de {systemPermissions.length})
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAllPermissions}
                  className="h-7 text-[10px] px-2"
                >
                  Marcar Todos
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={deselectAllPermissions}
                  className="h-7 text-[10px] px-2 text-muted-foreground"
                >
                  Desmarcar
                </Button>
              </div>
            </div>

            {isLoadingPerms ? (
              <div className="py-6 flex justify-center items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando catálogo de permisos...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                {systemPermissions.map((perm) => {
                  const isChecked = selectedPermissionIds.includes(perm.id);
                  return (
                    <div
                      key={perm.id}
                      onClick={() => togglePermission(perm.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-3 select-none ${
                        isChecked
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border/60 hover:bg-muted/40'
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
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {perm.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-border/60 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-9 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isPending}
              className="h-9 text-xs gap-1.5"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isEditing ? 'Guardar Cambios' : 'Crear Rol'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

