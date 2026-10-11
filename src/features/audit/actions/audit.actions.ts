import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import { AuditLogRecord } from '../types/audit.types';

export const fetchAuditLogsAction = async (): Promise<AuditLogRecord[]> => {
  try {
    const response = await apiClient.get<AuditLogRecord[] | { logs?: AuditLogRecord[]; data?: AuditLogRecord[] }>(
      API_ENDPOINTS.AUDIT.BASE,
      { suppressToast: true }
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray(response.data.logs)) {
      return response.data.logs;
    }
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch {
    return [];
  }
};

