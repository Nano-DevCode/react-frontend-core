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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ShieldCheck,
  Calendar,
  Clock,
  Key,
  Shield,
  User,
  Copy,
  Check,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useUserDetailQuery } from '../../hooks/use-users';
import type { UserRecord } from '../../types/users.types';

interface UserDetailsDialogProps {
  user: UserRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserDetailsDialog = ({
  user,
  open,
  onOpenChange,
}: UserDetailsDialogProps) => {
  const [copiedId, setCopiedId] = useState(false);
  const { data: detailData, isLoading } = useUserDetailQuery(
    open && user ? user.id : null
  );

  const activeUser = detailData || user;

  if (!activeUser) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(activeUser.id);
    setCopiedId(true);
    toast.success('ID copiado al portapapeles');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const initials = (
    activeUser.name?.[0] ||
    activeUser.email[0] ||
    'U'
  ).toUpperCase();

  const isDeleted = Boolean(activeUser.deletedAt);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2 border-b border-border/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border border-border/80 shadow-xs">
                {activeUser.profile?.avatarUrl && (
                  <AvatarImage src={activeUser.profile.avatarUrl} alt="Avatar" />
                )}
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                  <span>{initials}</span>
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>{activeUser.name || 'Sin nombre registrado'}</span>
                  {activeUser.twoFactor?.isEnabled && (
                    <span title="2FA Activado">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-mono">
                  <span>{activeUser.email}</span>
                </DialogDescription>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              {isDeleted ? (
                <Badge variant="destructive" className="text-[11px] font-semibold">
                  <span>En Papelera / Dado de baja</span>
                </Badge>
              ) : activeUser.isActive ? (
                <Badge variant="default" className="bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-semibold">
                  <span>Cuenta Activa</span>
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[11px] font-semibold">
                  <span>Suspendido</span>
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {isLoading && !detailData ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground text-xs gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando detalles completos...</span>
          </div>
        ) : (
          <div className="space-y-4 py-2 text-xs">
            {/* ID & Perfil */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/30 p-3 rounded-xl border border-border/60">
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-primary" />
                  <span>Identificador UUID</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-foreground truncate max-w-[170px]">
                    <span>{activeUser.id}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={handleCopyId}
                    title="Copiar UUID"
                  >
                    {copiedId ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>Desglose de Nombre y Apellidos</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                  <div className="rounded-md bg-muted/40 p-2 border border-border/40">
                    <span className="text-[10px] text-muted-foreground block">Nombre(s)</span>
                    <span className="font-semibold text-foreground text-xs">{activeUser.profile?.firstName || '—'}</span>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2 border border-border/40">
                    <span className="text-[10px] text-muted-foreground block">Primer Apellido</span>
                    <span className="font-semibold text-foreground text-xs">{activeUser.profile?.firstLastName || '—'}</span>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2 border border-border/40">
                    <span className="text-[10px] text-muted-foreground block">Segundo Apellido</span>
                    <span className="font-semibold text-foreground text-xs">{activeUser.profile?.secondLastName || '—'}</span>
                  </div>
                </div>
              </div>

              {activeUser.profile?.bio && (
                <div className="sm:col-span-2 space-y-1 pt-1 border-t border-border/40">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    <span>Biografía / Nota</span>
                  </span>
                  <p className="text-foreground/90 italic text-[11px]">
                    <span>{activeUser.profile.bio}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Roles y Jerarquía */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>Roles Asignados y Jerarquía</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {activeUser.roles && activeUser.roles.length > 0 ? (
                  activeUser.roles.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-card border border-border/80 px-2.5 py-1.5 rounded-lg shadow-2xs"
                    >
                      <Badge
                        variant={
                          r.role.name === 'superadmin'
                            ? 'destructive'
                            : r.role.name === 'admin'
                            ? 'admin'
                            : 'user'
                        }
                        className="text-[10px] py-0 px-2 font-semibold"
                      >
                        <span>{r.role.name}</span>
                      </Badge>
                      {r.role.priority !== undefined && (
                        <span className="text-[11px] text-muted-foreground font-mono">
                          <span>Prioridad: <strong>{r.role.priority}</strong></span>
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-muted-foreground text-xs italic">
                    <span>Sin roles asignados</span>
                  </span>
                )}
              </div>
            </div>

            {/* Permisos Efectivos */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-primary" />
                <span>Permisos del Sistema</span>
              </span>
              <div className="bg-muted/20 border border-border/60 p-2.5 rounded-xl max-h-36 overflow-y-auto">
                {activeUser.roles?.some((r) => r.role.name === 'superadmin' || r.role.name === 'admin') ? (
                  <div className="flex items-center gap-2 text-primary font-medium text-xs py-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Acceso Total por Rol de Alta Jerarquía (*Bypass RBAC*)</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {activeUser.roles?.flatMap((r) => r.role.permissions || []).length ? (
                      activeUser.roles
                        ?.flatMap((r) => r.role.permissions || [])
                        .map((p, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-[10px] font-mono text-foreground/80 bg-background"
                          >
                            <span>{p.permission.slug}</span>
                          </Badge>
                        ))
                    ) : (
                      <span className="text-muted-foreground text-xs italic">
                        <span>Sin permisos específicos asociados</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Fechas de Auditoría */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Registrado: {new Date(activeUser.createdAt).toLocaleString()}</span>
              </div>
              {activeUser.updatedAt && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Actualizado: {new Date(activeUser.updatedAt).toLocaleString()}</span>
                </div>
              )}
              {activeUser.deletedAt && (
                <div className="flex items-center gap-1.5 text-destructive sm:col-span-2">
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Baja efectuada: {new Date(activeUser.deletedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="pt-2 border-t border-border/50">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            <span>Cerrar</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

