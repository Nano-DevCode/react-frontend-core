import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, RotateCcw, UserX } from 'lucide-react';
import { useDeleteUserMutation, useRestoreUserMutation } from '../../hooks/use-users';
import type { UserRecord } from '../../types/users.types';

interface UserLifecycleDialogProps {
  user: UserRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserLifecycleDialog = ({
  user,
  open,
  onOpenChange,
}: UserLifecycleDialogProps) => {
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUserMutation();
  const { mutate: restoreUser, isPending: isRestoring } = useRestoreUserMutation();

  if (!user) return null;

  const isDeleted = Boolean(user.deletedAt);
  const isPending = isDeleting || isRestoring;

  const handleConfirm = () => {
    if (isDeleted) {
      restoreUser(user.id, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      deleteUser(user.id, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-full ${
                isDeleted
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {isDeleted ? (
                <RotateCcw className="h-5 w-5" />
              ) : (
                <UserX className="h-5 w-5" />
              )}
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="text-base font-bold text-foreground">
                <span>{isDeleted ? 'Dar de Alta / Restaurar Usuario' : 'Dar de Baja al Usuario'}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-mono">
                <span>{user.email}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 text-xs text-foreground/90 space-y-2">
          {isDeleted ? (
            <p>
              <span>
                ¿Estás seguro de que deseas <strong>restaurar</strong> esta cuenta? El usuario volverá a estar habilitado para acceder a la plataforma.
              </span>
            </p>
          ) : (
            <>
              <p>
                <span>
                  ¿Estás seguro de que deseas <strong>dar de baja</strong> a este usuario?
                </span>
              </p>
              <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg text-[11px] text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  El usuario será enviado a la papelera, su cuenta será desactivada y <strong>todas sus sesiones activas serán cerradas de inmediato</strong>.
                </span>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            <span>Cancelar</span>
          </Button>
          <Button
            variant={isDeleted ? 'default' : 'destructive'}
            size="sm"
            onClick={handleConfirm}
            disabled={isPending}
            className={`gap-1.5 ${isDeleted ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{isDeleted ? 'Confirmar Alta' : 'Confirmar Baja'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

