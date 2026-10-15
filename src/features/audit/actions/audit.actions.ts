import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type { AuditLogListItemResponse, AuditLogListResponse } from '../types/audit.types';

export const fetchAuditLogsAction = async (): Promise<AuditLogListItemResponse[]> => {
  const response = await apiClient.get<
    AuditLogListItemResponse[] | AuditLogListResponse
  >(API_ENDPOINTS.AUDIT.BASE, { suppressToast: true });

  const data = response.data;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if ('audits' in data && Array.isArray(data.audits)) return data.audits;
    if ('logs' in data && Array.isArray(data.logs)) return data.logs;
    if ('data' in data && Array.isArray(data.data)) return data.data;
  }
  return [];
};
