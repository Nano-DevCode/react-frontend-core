import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  fetchSystemLogsAction,
  fetchSystemLogStatsAction,
} from '../actions/system-logs.actions';
import type { LogQueryFilters } from '../types/system-log.types';

export const useSystemLogs = (filters: LogQueryFilters = {}) => {
  return useQuery({
    queryKey: ['system-logs', filters],
    queryFn: () => fetchSystemLogsAction(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 10, // 10 segundos
  });
};

export const useSystemLogStats = () => {
  return useQuery({
    queryKey: ['system-logs', 'stats'],
    queryFn: fetchSystemLogStatsAction,
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // Recarga automática cada 60 segundos
  });
};
