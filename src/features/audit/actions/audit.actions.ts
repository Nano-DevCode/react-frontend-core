import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type { AuditLogRecord } from '@/types';

export const fetchAuditLogsAction = async (): Promise<AuditLogRecord[]> => {
  try {
    const response = await apiClient.get<AuditLogRecord[]>(
      API_ENDPOINTS.AUDIT.BASE,
      { suppressToast: true }
    );
    return response.data;
  } catch {
    return [];
  }
};

