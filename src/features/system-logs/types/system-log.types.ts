// ============================================================================
// CONTRATOS DE REGISTROS DE SISTEMA (/system/logs)
// ============================================================================

export type LogSource = 'BACKEND' | 'FRONTEND';
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

/**
 * Atributos universales y compartidos de un Registro de Sistema
 */
export interface SystemLogBase {
  source: LogSource;
  level: LogLevel;
  context: string;
  message: string;
  stackTrace?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Representación de un log de sistema en listados y tablas (SystemLogListItemResponse)
 */
export interface SystemLogListItemResponse extends SystemLogBase {
  id: string;
  userId?: string | null;
  createdAt: string;
}

/**
 * Representación detallada de un log de sistema por su ID (SystemLogIdResponse)
 */
export type SystemLogIdResponse = SystemLogListItemResponse;

/**
 * Parámetros de filtrado para consulta de logs
 */
export interface LogQueryFilters {
  page?: number;
  limit?: number;
  source?: LogSource | 'ALL';
  level?: LogLevel | 'ALL';
  context?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Sobre de respuesta paginada de logs de sistema (SystemLogListResponse)
 */
export interface SystemLogListResponse {
  data: SystemLogListItemResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Métricas y estadísticas de logs
 */
export interface LogStats {
  totalErrors24h: number;
  sourceDistribution: {
    backend: number;
    frontend: number;
  };
  levelDistribution: {
    info: number;
    warn: number;
    error: number;
    fatal: number;
  };
  topFailingContexts: Array<{ context: string; count: number }>;
}

/**
 * DTO para reportar un log originado en el cliente (CreateClientLogDto)
 */
export interface CreateClientLogDto {
  level?: LogLevel;
  context: string;
  message: string;
  stackTrace?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
}

// ----------------------------------------------------------------------------
// ALIASES DE RETROCOMPATIBILIDAD
// ----------------------------------------------------------------------------
export type SystemLogRecord = SystemLogListItemResponse;
export type SystemLogDetailResponse = SystemLogIdResponse;
export type PaginatedLogsResponse = SystemLogListResponse;
export type ClientLogPayload = CreateClientLogDto;
