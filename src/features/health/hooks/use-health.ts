import { useQuery } from '@tanstack/react-query';
import { fetchHealthStatusAction, fetchSystemTelemetryAction } from '../actions/health.actions';

export const useHealthCheckQuery = (autoRefresh = true) => {
  return useQuery({
    queryKey: ['health', 'status'],
    queryFn: fetchHealthStatusAction,
    refetchInterval: autoRefresh ? 30000 : false, // Auto-refresh cada 30 segundos
    refetchIntervalInBackground: false,
  });
};

export const useSystemTelemetryQuery = (autoRefresh = true) => {
  return useQuery({
    queryKey: ['system', 'telemetry'],
    queryFn: fetchSystemTelemetryAction,
    refetchInterval: autoRefresh ? 15000 : false, // Auto-refresh cada 15 segundos para telemetría activa
    refetchIntervalInBackground: false,
  });
};
