import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import { HealthCheckResponse, SystemTelemetryResponse } from '../types/health.types';

export const fetchHealthStatusAction = async (): Promise<HealthCheckResponse> => {
  const response = await apiClient.get<HealthCheckResponse>(API_ENDPOINTS.HEALTH);
  return response.data;
};

export const fetchSystemTelemetryAction = async (): Promise<SystemTelemetryResponse> => {
  const response = await apiClient.get<SystemTelemetryResponse>(API_ENDPOINTS.SYSTEM.TELEMETRY);
  return response.data;
};
