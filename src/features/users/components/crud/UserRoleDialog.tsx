import { useState } from 'react';
import { Shield, Check, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAssignRoleMutation } from '../../hooks/use-users';
import type { UserRecord } from '../../types/users.types';

interface UserRoleDialogProps {
  user: UserRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_ROLES = [
  {
    name: 'admin',
    label: 'Administrador (admin)',
    description: 'Acceso total a todos los módulos, gestión de usuarios, roles, flags y auditoría.',
    permissions: ['* (Acceso Total)', 'users:*', 'files:*', 'audit:*', 'system:purge'],
    variant: 'admin' as const,
  },
  {
    name: 'user',
    label: 'Usuario Estándar (user)',
    description: 'Permite carga y visualización de archivos en S3 con análisis antivirus.',
    permissions: ['files.read', 'files.upload'],
    variant: 'user' as const,
  },
  {
    name: 'auditor',
    label: 'Auditor de Seguridad (auditor)',
    description: 'Consulta de trazabilidad, logs del sistema y visor de diferencias JSON.',
    permissions: ['audit.read', 'health.read', 'users:export'],
    variant: 'outline' as const,
  },
];

const RoleAssignmentForm = ({
  user,
  onClose,
}: {
  user: UserRecord;
  onClose: () => void;
}) => {
  const initialRoles = user.roles?.map((r) => r.role.name) || ['user'];
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialRoles);
  const { mutate: assignRoles, isPending } = useAssignRoleMutation();

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  const handleSave = () => {
    assignRoles(
      {
        userId: user.id,
        roleNames: selectedRoles.length > 0 ? selectedRoles : ['user'],
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <DialogTitle className="text-base font-bold">
            <span>Administrar Roles</span>
          </DialogTitle>
        </div>
        <DialogDescription className="text-xs">
          <span>Usuario:</span> <strong className="text-foreground">{user.email}</strong>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <label className="text-xs font-semibold text-foreground">
          <span>Selecciona los roles asignados:</span>
        </label>

        <div className="space-y-2">
          {AVAILABLE_ROLES.map((role) => {
            const isChecked = selectedRoles.includes(role.name);
            return (
              <div
                key={role.name}
                onClick={() => toggleRole(role.name)}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
                  isChecked
                    ? 'border-primary/50 bg-primary/5 shadow-xs'
                    : 'border-border/60 bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    isChecked
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/40'
                  }`}
                >
                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      <span>{role.label}</span>
                    </span>
                    <Badge variant={role.variant} className="text-[9px] py-0 px-1.5">
                      <span>{role.name}</span>
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    <span>{role.description}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DialogFooter className="gap-2 sm:justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
        >
          <span>Cancelar</span>
        </Button>
        <Button
          type="button"
          variant="default"
          onClick={handleSave}
          disabled={isPending || selectedRoles.length === 0}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <span>Guardar Cambios</span>
          )}
        </Button>
      </DialogFooter>
    </>
  );
};

export const UserRoleDialog = ({ user, open, onOpenChange }: UserRoleDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="notranslate max-w-lg">
        {user && (
          <RoleAssignmentForm
            key={user.id}
            user={user}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

