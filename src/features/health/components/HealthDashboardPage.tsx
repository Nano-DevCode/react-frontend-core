import { useState } from 'react';
import { Database, Server, HardDrive, ShieldCheck } from 'lucide-react';
import { BentoGridSkeleton } from '@/components/shared/BentoGridSkeleton';
import { HealthDashboardHeader } from './HealthDashboardHeader';
import { HealthServiceCard } from './HealthServiceCard';
import {
  MOCK_DB_SPARKLINE,
  MOCK_REDIS_SPARKLINE,
  MOCK_STORAGE_SPARKLINE,
} from '../constants/health-mock-data';
import { useHealthCheckQuery } from '../hooks/use-health';

export default function HealthDashboardPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { data: health, isLoading, isFetching, refetch } = useHealthCheckQuery(autoRefresh);

  if (isLoading) {
    return <BentoGridSkeleton />;
  }

  const isOk = health?.status === 'ok';
  const dbStatus = health?.details?.database?.status === 'up';
  const redisStatus = health?.details?.redis?.status === 'up';
  const storageStatus = health?.details?.storage?.status === 'up';

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Tarjeta 1: Base de Datos (PostgreSQL) */}
        <HealthServiceCard
          title="BASE DE DATOS (PostgreSQL)"
          icon={Database}
          iconColorClass="text-primary"
          description="Instancia de persistencia administrada con Prisma ORM"
          isUp={dbStatus}
          statusText={{ up: 'OPERACIONAL', down: 'ERROR' }}
          latencyMetric="3 ms"
          latencySubtitle="Latencia de Ping (Promedio)"
          techBadge="Prisma Client"
          sparklineData={MOCK_DB_SPARKLINE}
          sparklineColor="#8b5cf6"
          footerItems={[
            { label: 'Pool Conexiones', value: '10 activas' },
            { label: 'Migraciones', value: 'Sincronizadas' },
          ]}
        />

        {/* Tarjeta 2: Caché & Sesiones (Redis) */}
        <HealthServiceCard
          title="CACHÉ & SESIONES (Redis)"
          icon={Server}
          iconColorClass="text-indigo-500"
          description="Almacenamiento en memoria para tokens, 2FA y throttling"
          isUp={redisStatus}
          statusText={{ up: 'CONECTADO', down: 'ERROR' }}
          latencyMetric="1 ms"
          latencySubtitle="Comando PING → PONG"
          techBadge="ioredis v5"
          sparklineData={MOCK_REDIS_SPARKLINE}
          sparklineColor="#6366f1"
          footerItems={[
            { label: 'Uptime', value: '99.98%' },
            { label: 'Tokens en Blacklist', value: '12' },
          ]}
        />

        {/* Tarjeta 3: Almacenamiento (SeaweedFS / S3) */}
        <HealthServiceCard
          title="ALMACENAMIENTO (SeaweedFS / S3)"
          icon={HardDrive}
          iconColorClass="text-emerald-500"
          description="S3 compatible con protección ClamAV en caliente"
          isUp={storageStatus}
          statusText={{ up: 'BUCKET MONTADO', down: 'ERROR' }}
          latencyMetric="9 ms"
          latencySubtitle="Acceso al Bucket S3"
          techBadge="AWS SDK v3"
          sparklineData={MOCK_STORAGE_SPARKLINE}
          sparklineColor="#10b981"
          footerItems={[
            { label: 'ClamAV', value: 'Activo', icon: ShieldCheck },
            { label: 'Disponibilidad', value: '100%' },
          ]}
        />
      </div>
    </div>
  );
}
