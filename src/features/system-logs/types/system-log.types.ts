export type LogSource = 'BACKEND' | 'FRONTEND';
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface SystemLogRecord {
  id: string;
  source: LogSource;
  level: LogLevel;
  context: string;
  message: string;
  stackTrace?: string | null;
  metadata?: Record<string, unknown> | null;
  userId?: string | null;
  createdAt: string;
}

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

export interface PaginatedLogsResponse {
  data: SystemLogRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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

export interface ClientLogPayload {
  level?: LogLevel;
  context: string;
  message: string;
  stackTrace?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
}
