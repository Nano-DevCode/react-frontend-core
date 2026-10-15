// ============================================================================
// CONTRATOS DE SALUD Y OBSERVABILIDAD (/health y /system/telemetry)
// ============================================================================

export interface HealthIndicatorDetail {
  status: 'up' | 'down' | 'ok' | string;
  message?: string;
  latencyMs?: number;
  [key: string]: unknown;
}

export interface MemoryHealthDetail extends HealthIndicatorDetail {
  heapUsed?: number;
  heapTotal?: number;
  rss?: number;
}

/**
 * Atributos universales y compartidos del estado de salud
 */
export interface HealthBase {
  status: 'ok' | 'error' | 'shutting_down' | string;
}

/**
 * Respuesta completa de verificación de salud del sistema (HealthCheckResponse)
 */
export interface HealthCheckResponse extends HealthBase {
  status: 'ok' | 'error' | 'shutting_down';
  info?: {
    database?: HealthIndicatorDetail;
    database_replica?: HealthIndicatorDetail;
    redis?: HealthIndicatorDetail;
    storage?: HealthIndicatorDetail;
    memory?: MemoryHealthDetail;
    [key: string]: HealthIndicatorDetail | undefined;
  };
  error?: Record<string, HealthIndicatorDetail>;
  details: {
    database?: HealthIndicatorDetail;
    database_replica?: HealthIndicatorDetail;
    redis?: HealthIndicatorDetail;
    storage?: HealthIndicatorDetail;
    memory?: MemoryHealthDetail;
    [key: string]: HealthIndicatorDetail | undefined;
  };
}

export interface QueueMetricDetail {
  waiting: number;
  active: number;
  failed: number;
  completed: number;
  status: 'healthy' | 'degraded' | 'warning';
}

export interface BullMqTelemetry {
  pdf: QueueMetricDetail;
  logs: QueueMetricDetail;
  totalWaiting: number;
  totalActive: number;
  totalFailed: number;
  status: 'healthy' | 'degraded' | 'warning';
}

export interface WebSocketsTelemetry {
  connectedClients: number;
  latencyMs: number;
  status: 'online' | 'idle' | 'offline';
}

export interface StorageTelemetry {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  usedPercentage: number;
  totalFiles: number;
  clamAvStatus: 'active' | 'inactive';
}

export interface SecurityTelemetry {
  throttledRequestsLastHour: number;
  blockedIpsCount: number;
  blockedIps: string[];
  firewallStatus: 'active' | 'warning';
}

/**
 * Atributos base de telemetría
 */
export interface TelemetryBase {
  timestamp: string;
  uptimeSeconds: number;
}

/**
 * Respuesta completa de telemetría del sistema (SystemTelemetryResponse)
 */
export interface SystemTelemetryResponse extends TelemetryBase {
  queues: BullMqTelemetry;
  websockets: WebSocketsTelemetry;
  storage: StorageTelemetry;
  security: SecurityTelemetry;
}

// ----------------------------------------------------------------------------
// ALIASES DE RETROCOMPATIBILIDAD
// ----------------------------------------------------------------------------
export type HealthStatusResponse = HealthCheckResponse;
export type TelemetryResponse = SystemTelemetryResponse;
