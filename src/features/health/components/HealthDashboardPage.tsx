import { useState } from 'react';
import {
  Database,
  Server,
  HardDrive,
  ShieldCheck,
  Layers,
  Cpu,
} from 'lucide-react';
import { BentoGridSkeleton } from '@/components/shared/BentoGridSkeleton';
import { HealthDashboardHeader } from './HealthDashboardHeader';
import { HealthServiceCard } from './HealthServiceCard';
import {
  MOCK_DB_SPARKLINE,
  MOCK_REPLICA_SPARKLINE,
  MOCK_REDIS_SPARKLINE,
  MOCK_STORAGE_SPARKLINE,
  MOCK_MEMORY_SPARKLINE,
} from '../constants/health-mock-data';
import { useHealthCheckQuery } from '../hooks/use-health';
import type { HealthCheckResponse, MemoryHealthDetail } from '@/types/health.types';

/**
 * Valida si un servicio reportado por NestJS Terminus se encuentra saludable.
 * Considera válido tanto 'up' como 'ok' de forma robusta e insensible a mayúsculas.
 */
function isServiceHealthy(
  serviceKey: string,
  health?: HealthCheckResponse | null
): boolean {
  if (!health) return false;

  // 1. Extraer detalle desde details o info (ambos son utilizados por NestJS Terminus)
  const detail =
    health.details?.[serviceKey] ??
    health.info?.[serviceKey];

  if (detail) {
    if (typeof detail === 'object' && 'status' in detail) {
      const s = String((detail as { status: unknown }).status).toLowerCase();
      return (
        s === 'up' ||
        s === 'ok' ||
        s === 'healthy' ||
        s === 'operational'
      );
    }
    if (typeof detail === 'string') {
      const s = (detail as string).toLowerCase();
      return (
        s === 'up' ||
        s === 'ok' ||
        s === 'healthy' ||
        s === 'operational'
      );
    }
    if (typeof detail === 'boolean') {
      return detail;
    }
  }

  // 2. Si no hay error explícito para este servicio y el estado global de Terminus es 'ok' o 'up'
  const globalStatus = health.status?.toLowerCase();
  const isGlobalOk = globalStatus === 'ok' || globalStatus === 'up';
  const hasSpecificError = Boolean(health.error?.[serviceKey]);

  return isGlobalOk && !hasSpecificError;
}

export default function HealthDashboardPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { data: health, isLoading, isFetching, refetch } = useHealthCheckQuery(autoRefresh);

  if (isLoading) {
    return <BentoGridSkeleton />;
  }

  const isOk =
    health?.status?.toLowerCase() === 'ok' ||
    health?.status?.toLowerCase() === 'up';

  const dbStatus = isServiceHealthy('database', health);
  const replicaDetail =
    health?.details?.database_replica ??
    health?.info?.database_replica;
  const hasReplica = Boolean(replicaDetail);

  // 1. Estado caído / offline: status === 'down' o reportado en error.database_replica
  const isReplicaOffline =
    replicaDetail?.status === 'down' ||
    Boolean(health?.error?.database_replica);

  // 2. Estado sincronizado: saludable sin banderas de desalineamiento
  const isReplicaSynced =
    !isReplicaOffline &&
    (replicaDetail?.status === 'up' || replicaDetail?.status === 'ok') &&
    replicaDetail?.sync !== 'desalineada' &&
    replicaDetail?.sync !== 'desync' &&
    replicaDetail?.mode !== 'standalone';

  // Badge dinámico para la réplica:
  // - Si está sincronizada: verde 'SINCRONIZADA'
  // - Si responde ping (< 10 ms o reachable) pero no está en cluster sincronizado: amarilla 'STANDALONE / LOCAL'
  // - Si está caída / inalcanzable: rojo 'OFFLINE'
  const replicaBadge = isReplicaSynced
    ? { text: 'SINCRONIZADA', variant: 'success' as const }
    : !isReplicaOffline
    ? { text: 'STANDALONE / LOCAL', variant: 'warning' as const }
    : { text: 'OFFLINE', variant: 'error' as const };

  const redisStatus = isServiceHealthy('redis', health);
  const storageStatus = isServiceHealthy('storage', health);

  const memoryDetail = (health?.details?.memory ??
    health?.info?.memory) as MemoryHealthDetail | undefined;
  const hasMemory = Boolean(memoryDetail);
  const memoryStatus = hasMemory ? isServiceHealthy('memory', health) : false;

  return (
    <div className="notranslate space-y-6">
      {/* Header */}
      <HealthDashboardHeader
        isOk={isOk}
        autoRefresh={autoRefresh}
        onAutoRefreshChange={setAutoRefresh}
        onRefetch={() => refetch()}
        isFetching={isFetching}
      />

      {/* Grid Bento de Observabilidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Tarjeta 1: Base de Datos Primaria (PostgreSQL) */}
        <HealthServiceCard
          title="BASE DE DATOS PRIMARIA (PostgreSQL)"
          icon={Database}
          iconColorClass="text-primary"
          description="Instancia de persistencia y escrituras con connection pool optimizado"
          isUp={dbStatus}
          statusText={{ up: 'OPERACIONAL', down: 'ERROR' }}
          latencyMetric="2 ms"
          latencySubtitle="Latencia de Ping (Pool pg)"
          techBadge="Prisma Client + pg"
          sparklineData={MOCK_DB_SPARKLINE}
          sparklineColor="#8b5cf6"
          footerItems={[
            { label: 'Pool Conexiones', value: '30 máx / 5 min' },
            { label: 'Statement Timeout', value: '10s' },
          ]}
        />

        {/* Tarjeta Condicional: Réplica de Lectura (Read Replica) */}
        {hasReplica && (
          <HealthServiceCard
            title="RÉPLICA DE LECTURA (Read Replica)"
            icon={Layers}
            iconColorClass="text-sky-500"
            description="Instancia secundaria sincronizada para descarga de consultas de lectura"
            isUp={isReplicaSynced}
            statusBadge={replicaBadge}
            latencyMetric="2 ms"
            latencySubtitle={
              isReplicaSynced
                ? 'Lag de Replicación: 0 ms'
                : !isReplicaOffline
                ? 'Instancia Respondiendo (Standalone)'
                : 'Instancia Inalcanzable'
            }
            techBadge="PostgreSQL Replica"
            sparklineData={MOCK_REPLICA_SPARKLINE}
            sparklineColor="#0284c7"
            footerItems={[
              {
                label: 'Modo',
                value: isReplicaSynced
                  ? 'Solo Lectura'
                  : !isReplicaOffline
                  ? 'Standalone'
                  : 'Desconectada',
              },
              {
                label: 'Estado Sync',
                value: isReplicaSynced
                  ? 'Sincronizada (< 5 ms)'
                  : !isReplicaOffline
                  ? 'Local / Standalone'
                  : 'Offline',
              },
            ]}
          />
        )}

        {/* Tarjeta: Caché & Throttler (Redis) */}
        <HealthServiceCard
          title="CACHÉ & THROTTLER (Redis)"
          icon={Server}
          iconColorClass="text-indigo-500"
          description="Almacenamiento en memoria para tokens, 2FA, cache-aside y rate limit"
          isUp={redisStatus}
          statusText={{ up: 'CONECTADO', down: 'ERROR' }}
          latencyMetric="1 ms"
          latencySubtitle="Comando PING → PONG"
          techBadge="ioredis / Throttler"
          sparklineData={MOCK_REDIS_SPARKLINE}
          sparklineColor="#6366f1"
          footerItems={[
            { label: 'Uptime', value: '99.99%' },
            { label: 'Throttler Redis', value: 'Distribuido' },
          ]}
        />

        {/* Tarjeta: Almacenamiento (SeaweedFS / S3) */}
        <HealthServiceCard
          title="ALMACENAMIENTO (SeaweedFS / S3)"
          icon={HardDrive}
          iconColorClass="text-emerald-500"
          description="S3 compatible con protección ClamAV y optimización WebP"
          isUp={storageStatus}
          statusText={{ up: 'BUCKET MONTADO', down: 'ERROR' }}
          latencyMetric="8 ms"
          latencySubtitle="Acceso al Bucket S3"
          techBadge="AWS SDK v3"
          sparklineData={MOCK_STORAGE_SPARKLINE}
          sparklineColor="#10b981"
          footerItems={[
            { label: 'ClamAV Daemon', value: 'Activo', icon: ShieldCheck },
            { label: 'Subida Paralela', value: 'Habilitada' },
          ]}
        />

        {/* Tarjeta: Memoria & Recursos Node.js */}
        {hasMemory && (
          <HealthServiceCard
            title="MEMORIA & RECURSOS (Node.js)"
            icon={Cpu}
            iconColorClass="text-amber-500"
            description="Monitoreo de heap, RSS y utilización de memoria del runtime"
            isUp={memoryStatus}
            statusText={{ up: 'ESTABLE', down: 'ALERTA' }}
            latencyMetric={
              memoryDetail?.heapUsed
                ? `${Math.round(Number(memoryDetail.heapUsed) / (1024 * 1024))} MB`
                : '45 MB'
            }
            latencySubtitle="Heap Memory en uso"
            techBadge="V8 Runtime"
            sparklineData={MOCK_MEMORY_SPARKLINE}
            sparklineColor="#f59e0b"
            footerItems={[
              {
                label: 'Heap Total',
                value: memoryDetail?.heapTotal
                  ? `${Math.round(Number(memoryDetail.heapTotal) / (1024 * 1024))} MB`
                  : '96 MB',
              },
              { label: 'GC Status', value: 'Normal' },
            ]}
          />
        )}
      </div>
    </div>
  );
}
