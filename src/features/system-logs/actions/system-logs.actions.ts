import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type {
  LogQueryFilters,
  PaginatedLogsResponse,
  LogStats,
  ClientLogPayload,
} from '../types/system-log.types';

export const fetchSystemLogsAction = async (
  filters: LogQueryFilters = {}
): Promise<PaginatedLogsResponse> => {
  const params: Record<string, unknown> = {
    page: filters.page || 1,
    limit: filters.limit || 20,
  };

  if (filters.source && filters.source !== 'ALL') {
    params.source = filters.source;
  }

  if (filters.level && filters.level !== 'ALL') {
    params.level = filters.level;
  }

  if (filters.context?.trim()) {
    params.context = filters.context.trim();
  }

  if (filters.search?.trim()) {
    params.search = filters.search.trim();
  }

  if (filters.startDate) {
    params.startDate = filters.startDate;
  }

  if (filters.endDate) {
    params.endDate = filters.endDate;
  }

  const response = await apiClient.get<PaginatedLogsResponse>(
    API_ENDPOINTS.LOGS.BASE,
    {
      params,
      suppressToast: true,
    }
  );

  return response.data;
};

export const fetchSystemLogStatsAction = async (): Promise<LogStats> => {
  const response = await apiClient.get<LogStats>(API_ENDPOINTS.LOGS.STATS, {
    suppressToast: true,
  });
  return response.data;
};

export const reportClientLogAction = async (
  payload: ClientLogPayload
): Promise<void> => {
  try {
    await apiClient.post(API_ENDPOINTS.LOGS.CLIENT, payload, {
      suppressToast: true,
    });
  } catch {
    // Silenciar errores en el envío de logs para no desencadenar cascadas de errores
  }
};

