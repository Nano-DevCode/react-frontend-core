import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type { HealthCheckResponse } from '@/types/health.types';

export const fetchHealthStatusAction = async (): Promise<HealthCheckResponse> => {
  const response = await apiClient.get<HealthCheckResponse>(API_ENDPOINTS.HEALTH);
  return response.data;
};

