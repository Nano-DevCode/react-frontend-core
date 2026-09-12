import { Users, HardDrive, ShieldCheck, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardMetricsGridProps {
  primaryRole?: string;
  isTwoFactorEnabled?: boolean;
}

export const DashboardMetricsGrid = ({
  primaryRole = 'user',
  isTwoFactorEnabled = false,
}: DashboardMetricsGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Tarjeta 1: Usuarios */}
      <Card className="border-border/80 hover-lift bg-card/90">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground font-medium"><span>Control RBAC</span></span>
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground"><span>Roles Activos</span></div>
            <div className="flex items-center gap-1.5">
              <Badge variant="admin" className="text-[10px] py-0 px-2 capitalize font-semibold">
                <span>{primaryRole}</span>
              </Badge>
              <span className="text-[11px] text-muted-foreground"><span>Asignado</span></span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20">
            <Users className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      {/* Tarjeta 2: Almacenamiento S3 */}
      <Card className="border-border/80 hover-lift bg-card/90">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground font-medium"><span>Almacenamiento S3</span></span>
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground"><span>-65% Peso</span></div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span>WebP + ClamAV</span>
              </span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
            <HardDrive className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      {/* Tarjeta 3: Seguridad 2FA */}
      <Card className="border-border/80 hover-lift bg-card/90">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground font-medium"><span>Autenticación 2FA</span></span>
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
              <span>{isTwoFactorEnabled ? 'Habilitado' : 'Pendiente'}</span>
            </div>
            <div>
              <Badge variant={isTwoFactorEnabled ? 'success' : 'warning'} className="text-[10px] py-0">
                <span>{isTwoFactorEnabled ? 'TOTP Blindado' : 'Recomendado'}</span>
              </Badge>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      {/* Tarjeta 4: Infraestructura */}
      <Card className="border-border/80 hover-lift bg-card/90">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground font-medium"><span>Disponibilidad SLA</span></span>
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground"><span>99.98%</span></div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] text-muted-foreground font-mono">
                <span>PG + Redis + S3</span>
              </span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
            <Activity className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

