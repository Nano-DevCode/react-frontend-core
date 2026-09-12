import { useQuery } from '@tanstack/react-query';
import { fetchHealthStatusAction } from '../actions/health.actions';

export const useHealthCheckQuery = (autoRefresh = true) => {
  return useQuery({
    queryKey: ['health', 'status'],
    queryFn: fetchHealthStatusAction,
    refetchInterval: autoRefresh ? 30000 : false, // Auto-refresh cada 30 segundos
    refetchIntervalInBackground: false,
  });
};

