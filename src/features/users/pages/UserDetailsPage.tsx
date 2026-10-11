import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  UserX,
  RotateCcw,
  ShieldCheck,
  Shield,
  Key,
  User,
  Calendar,
  Clock,
  Trash2,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useUserDetailQuery } from '../hooks/use-users';
import { UserLifecycleDialog } from '../components/crud/UserLifecycleDialog';

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(false);
  const [isLifecycleOpen, setIsLifecycleOpen] = useState(false);

  const { data: user, isLoading, isError } = useUserDetailQuery(id ?? null);

  const handleCopyId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    toast.success('ID copiado al portapapeles');
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span>Cargando información del usuario...</span>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <h3 className="text-base font-bold text-foreground">Usuario no encontrado</h3>
        <p className="text-xs text-muted-foreground">
          El identificador solicitado no existe o fue eliminado definitivamente.
        </p>
        <Button size="sm" onClick={() => navigate('/usuarios')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          <span>Volver al directorio</span>
        </Button>
      </div>
    );
  }

  const initials = (user.name?.[0] || user.email[0] || 'U').toUpperCase();
  const isDeleted = Boolean(user.deletedAt);

  return (
    <div className="notranslate max-w-4xl mx-auto space-y-6">
      {/* Botón Volver */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/usuarios')}
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al directorio</span>
        </Button>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/usuarios/${user.id}/editar`)}
            className="h-8 gap-1.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Editar Usuario</span>
          </Button>

          {isDeleted ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsLifecycleOpen(true)}
              className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Dar de Alta (Restaurar)</span>
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsLifecycleOpen(true)}
              className="h-8 gap-1.5 text-xs"
            >
              <UserX className="h-3.5 w-3.5" />
              <span>Dar de Baja</span>
            </Button>
          )}
        </div>
      </div>

      {/* Hero Card de Identidad */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-border/80 shadow-sm">
                {user.profile?.avatarUrl && (
                  <AvatarImage src={user.profile.avatarUrl} alt="Avatar" />
                )}
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                  <span>{initials}</span>
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-bold text-foreground m-0">
                    <span>{user.name || 'Sin nombre registrado'}</span>
                  </h2>
                  {user.twoFactor?.isEnabled && (
                    <Badge variant="outline" className="text-[10px] gap-1 text-emerald-600 border-emerald-500/30">
                      <ShieldCheck className="h-3 w-3" />
                      <span>2FA Activo</span>
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground font-mono">
                  <span>{user.email}</span>
                </p>

                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    <span>ID: {user.id}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-muted-foreground hover:text-foreground"
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
            </div>

            <div className="flex sm:flex-col items-start sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40">
              <span className="text-[11px] text-muted-foreground font-medium">
                <span>Estado de la cuenta:</span>
              </span>
              {isDeleted ? (
                <Badge variant="destructive" className="text-xs font-semibold py-1 px-3">
                  <span>En Papelera / Dado de baja</span>
                </Badge>
              ) : user.isActive ? (
                <Badge variant="default" className="bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold py-1 px-3">
                  <span>Cuenta Activa</span>
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs font-semibold py-1 px-3">
                  <span>Suspendido</span>
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Secciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información del Perfil */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>Información del Perfil</span>
            </CardTitle>
            <CardDescription className="text-xs">
              <span>Datos personales y biográficos registrados en el sistema.</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-xl border border-border/50">
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-muted-foreground">
                  <span>Primer Nombre</span>
                </span>
                <span className="text-foreground font-semibold block">
                  <span>{user.profile?.firstName || 'No especificado'}</span>
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-muted-foreground">
                  <span>Apellidos</span>
                </span>
                <span className="text-foreground font-semibold block">
                  <span>{user.profile?.lastName || 'No especificado'}</span>
                </span>
              </div>
            </div>

            <div className="space-y-1 bg-muted/20 p-3 rounded-xl border border-border/50">
              <span className="text-[11px] font-medium text-muted-foreground">
                <span>Biografía / Cargo</span>
              </span>
              <p className="text-foreground text-xs leading-relaxed m-0 italic">
                <span>{user.profile?.bio || 'Sin biografía o descripción registrada.'}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Roles y Jerarquía */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Roles y Jerarquía RBAC</span>
            </CardTitle>
            <CardDescription className="text-xs">
              <span>Roles asignados con su respectiva prioridad en el sistema.</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex flex-wrap gap-2.5">
              {user.roles && user.roles.length > 0 ? (
                user.roles.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-card border border-border/80 px-3 py-2 rounded-xl shadow-2xs"
                  >
                    <Badge
                      variant={
                        r.role.name === 'superadmin'
                          ? 'destructive'
                          : r.role.name === 'admin'
                          ? 'admin'
                          : 'user'
                      }
                      className="text-xs font-semibold py-0.5 px-2.5"
                    >
                      <span>{r.role.name}</span>
                    </Badge>
                    {r.role.priority !== undefined && (
                      <span className="text-xs text-muted-foreground font-mono">
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
          </CardContent>
        </Card>

        {/* Permisos Efectivos */}
        <Card className="border-border/80 shadow-xs md:col-span-2">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              <span>Catálogo de Permisos Efectivos</span>
            </CardTitle>
            <CardDescription className="text-xs">
              <span>Acciones autorizadas para este usuario derivadas de sus roles.</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {user.roles?.some((r) => r.role.name === 'superadmin' || r.role.name === 'admin') ? (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-emerald-700 dark:text-emerald-400 font-medium text-xs">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>
                  <strong>Acceso Total (Superadministrador / Administrador):</strong> Esta cuenta cuenta con permisos ilimitados en todos los módulos (*Bypass RBAC*).
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.roles?.flatMap((r) => r.role.permissions || []).length ? (
                  user.roles
                    ?.flatMap((r) => r.role.permissions || [])
                    .map((p, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs font-mono py-1 px-2.5 text-foreground bg-muted/30"
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
          </CardContent>
        </Card>

        {/* Fechas de Auditoría */}
        <Card className="border-border/80 shadow-xs md:col-span-2">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Trazabilidad y Auditoría</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 bg-muted/20 p-3 rounded-xl border border-border/40">
                <Calendar className="h-4 w-4 text-primary" />
                <div className="space-y-0.5">
                  <span className="text-[11px] block font-medium">Fecha de Registro</span>
                  <span className="text-foreground font-semibold block">
                    {new Date(user.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {user.updatedAt && (
                <div className="flex items-center gap-2 bg-muted/20 p-3 rounded-xl border border-border/40">
                  <Clock className="h-4 w-4 text-primary" />
                  <div className="space-y-0.5">
                    <span className="text-[11px] block font-medium">Última Modificación</span>
                    <span className="text-foreground font-semibold block">
                      {new Date(user.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {user.deletedAt && (
                <div className="flex items-center gap-2 bg-destructive/10 p-3 rounded-xl border border-destructive/20 text-destructive">
                  <Trash2 className="h-4 w-4" />
                  <div className="space-y-0.5">
                    <span className="text-[11px] block font-medium">Fecha de Baja</span>
                    <span className="font-semibold block">
                      {new Date(user.deletedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de Confirmación para Dar de Baja / Alta */}
      <UserLifecycleDialog
        user={user}
        open={isLifecycleOpen}
        onOpenChange={setIsLifecycleOpen}
      />
    </div>
  );
}

