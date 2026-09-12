// ============================================================================
// CONTRATOS DE SALUD Y OBSERVABILIDAD (/health)
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

export interface HealthCheckResponse {
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
