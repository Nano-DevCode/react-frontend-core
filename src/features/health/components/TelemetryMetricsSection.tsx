import {
  Workflow,
  Radio,
  HardDrive,
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
} from 'lucide-react';
import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useSystemTelemetryQuery } from '../hooks/use-health';

interface TelemetryMetricsSectionProps {
  autoRefresh?: boolean;
}

export const TelemetryMetricsSection = ({
  autoRefresh = true,
}: TelemetryMetricsSectionProps) => {
  const { data: telemetry, isLoading } = useSystemTelemetryQuery(autoRefresh);

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Métricas extraídas con fallbacks defensivos
  const queues = telemetry?.queues;
  const websockets = telemetry?.websockets;
  const storage = telemetry?.storage;
  const security = telemetry?.security;

  const usedGb = storage ? (storage.usedBytes / (1024 * 1024 * 1024)).toFixed(2) : '0.00';
  const totalGb = storage ? (storage.totalBytes / (1024 * 1024 * 1024)).toFixed(0) : '50';
  const usedPct = storage?.usedPercentage ?? 0;

  return (
    <div className="space-y-4 pt-2">
      {/* Encabezado de Sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Zap className="h-4 w-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground m-0">
            TELEMETRÍA OPERATIVA Y SEGURIDAD PERIMETRAL
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>BullMQ + WS + Storage + Firewall</span>
        </div>
      </div>

      {/* Grid de 4 Tarjetas de Telemetría */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* ------------------------------------------------------------------ */}
        {/* Tarjeta 1: Colas de Trabajo (BullMQ)                                */}
        {/* ------------------------------------------------------------------ */}
        <Card className="relative overflow-hidden border-border/80 hover-lift bg-card/90 shadow-2xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-xs text-primary">
                <Workflow className="h-4 w-4" />
                <span>COLAS DE TRABAJO (BullMQ)</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-xs shadow-emerald-500/50" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                  {queues?.status === 'warning' ? 'ALERTA' : 'OPERACIONAL'}
                </span>
              </div>
            </div>
            <CardDescription className="text-xs">
              Procesamiento asíncrono de PDFs y micro-lotes de logs
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between pt-1">
              <div className="flex flex-col">
                <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
                  {queues?.totalActive ?? 0}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {queues?.totalWaiting ?? 0} trabajos pendientes en cola
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/20 bg-primary/5">
                2 Colas Activas
              </Badge>
            </div>

            {/* Desglose por Cola */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-[11px]">
              <div className="bg-secondary/40 p-2 rounded-lg space-y-0.5">
                <span className="text-muted-foreground block text-[10px] font-medium">Cola PDFs</span>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-foreground font-semibold">{queues?.pdf.active ?? 0} act</span>
                  <span className="text-emerald-500">{queues?.pdf.completed ?? 0} ok</span>
                </div>
              </div>
              <div className="bg-secondary/40 p-2 rounded-lg space-y-0.5">
                <span className="text-muted-foreground block text-[10px] font-medium">Cola Logs</span>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-foreground font-semibold">{queues?.logs.active ?? 0} act</span>
                  <span className="text-emerald-500">{queues?.logs.completed ?? 0} ok</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {(queues?.pdf.completed ?? 0) + (queues?.logs.completed ?? 0)} Éxitos
              </span>
              <span className="flex items-center gap-1 text-amber-500">
                <AlertTriangle className="w-3.5 h-3.5" />
                {queues?.totalFailed ?? 0} Fallidos
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ------------------------------------------------------------------ */}
        {/* Tarjeta 2: Conexiones Realtime (WebSockets)                          */}
        {/* ------------------------------------------------------------------ */}
        <Card className="relative overflow-hidden border-border/80 hover-lift bg-card/90 shadow-2xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-xs text-sky-500">
                <Radio className="h-4 w-4" />
                <span>CONEXIONES REALTIME</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse shadow-xs shadow-sky-500/50" />
                <span className="text-sky-600 dark:text-sky-400 font-bold text-[11px]">
                  {websockets?.status === 'online' ? 'EN LÍNEA' : 'DISPONIBLE'}
                </span>
              </div>
            </div>
            <CardDescription className="text-xs">
              Canal de notificaciones y eventos Socket.IO v4
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between pt-1">
              <div className="flex flex-col">
                <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
                  {websockets?.connectedClients ?? 0}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Clientes conectados en vivo
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-sky-500/20 bg-sky-500/5 text-sky-500">
                {websockets?.latencyMs ?? 1} ms ping
              </Badge>
            </div>

            {/* Detalles Técnicos WS */}
            <div className="space-y-1.5 pt-1 border-t border-border/40 text-[11px]">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Namespace:</span>
                <span className="font-mono text-foreground font-medium">/realtime/notifications</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Transporte:</span>
                <span className="font-mono text-foreground font-medium">WebSocket + Polling</span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                Heartbeat: 25s
              </span>
              <span className="text-emerald-500 font-medium">TLS Cifrado</span>
            </div>
          </CardContent>
        </Card>

        {/* ------------------------------------------------------------------ */}
        {/* Tarjeta 3: Capacidad SeaweedFS                                      */}
        {/* ------------------------------------------------------------------ */}
        <Card className="relative overflow-hidden border-border/80 hover-lift bg-card/90 shadow-2xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-xs text-emerald-500">
                <HardDrive className="h-4 w-4" />
                <span>CAPACIDAD SEAWEEDFS</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-xs shadow-emerald-500/50" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                  {usedPct > 90 ? 'CASI LLENO' : 'DISPONIBLE'}
                </span>
              </div>
            </div>
            <CardDescription className="text-xs">
              Volumen S3 compatible con escaneo ClamAV
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between pt-1">
              <div className="flex flex-col">
                <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
                  {usedGb} <span className="text-sm font-normal text-muted-foreground">/ {totalGb} GB</span>
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {usedPct}% utilizado ({storage?.totalFiles ?? 0} archivos)
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/20 bg-emerald-500/5 text-emerald-500">
                Quota 50 GB
              </Badge>
            </div>

            {/* Barra de Progreso */}
            <div className="pt-1">
              <Progress
                value={Math.max(2, usedPct)}
                indicatorClassName={usedPct > 85 ? 'bg-red-500' : usedPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}
              />
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                ClamAV: {storage?.clamAvStatus === 'active' ? 'Activo' : 'Standby'}
              </span>
              <span>WebP Auto</span>
            </div>
          </CardContent>
        </Card>

        {/* ------------------------------------------------------------------ */}
        {/* Tarjeta 4: Tráfico & Rate Limit                                     */}
        {/* ------------------------------------------------------------------ */}
        <Card className="relative overflow-hidden border-border/80 hover-lift bg-card/90 shadow-2xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-xs text-amber-500">
                <ShieldAlert className="h-4 w-4" />
                <span>TRÁFICO & RATE LIMIT</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shadow-xs shadow-amber-500/50" />
                <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                  FIREWALL ACTIVO
                </span>
              </div>
            </div>
            <CardDescription className="text-xs">
              Mitigación de bombardeo en Redis e iptables
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between pt-1">
              <div className="flex flex-col">
                <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
                  {security?.throttledRequestsLastHour ?? 0}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Peticiones 429 frenadas (última hora)
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-amber-500/20 bg-amber-500/5 text-amber-500">
                Fail2Ban 1h Ban
              </Badge>
            </div>

            {/* Detalle de IPs Bloqueadas */}
            <div className="space-y-1 pt-1 border-t border-border/40 text-[11px]">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>IPs en Lista de Bloqueo:</span>
                <span className="font-mono text-foreground font-semibold">
                  {security?.blockedIpsCount ?? 0} atacantes
                </span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Cadena Firewall:</span>
                <span className="font-mono text-foreground font-medium">DOCKER-USER</span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1 text-emerald-500">
                <Server className="w-3.5 h-3.5" />
                Protegido
              </span>
              <span>20r/s Burst</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TelemetryMetricsSection;
