import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogsAction } from '../actions/audit.actions';

export const useAuditLogsQuery = () => {
  return useQuery({
    queryKey: ['audit', 'logs'],
    queryFn: fetchAuditLogsAction,
    retry: false,
    staleTime: 1000 * 30, // 30s
  });
};

