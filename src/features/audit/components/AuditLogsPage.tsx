import { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { JsonDiffViewerModal } from './JsonDiffViewerModal';
import { AuditLogsToolbar, type AuditActionFilter } from './AuditLogsToolbar';
import { AuditLogsTable } from './AuditLogsTable';
import { useAuditLogsQuery } from '../hooks/use-audit';
import { FALLBACK_AUDIT_LOGS } from '../constants/audit-fallback';
import { AuditLogRecord } from '../types/audit.types';

export default function AuditLogsPage() {
  const { data: apiLogs, isLoading, refetch } = useAuditLogsQuery();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditActionFilter>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);

  const logs: AuditLogRecord[] =
    apiLogs && apiLogs.length > 0 ? apiLogs : FALLBACK_AUDIT_LOGS;

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchAction =
        actionFilter === 'ALL' || log.action.toUpperCase() === actionFilter.toUpperCase();
      const matchSearch =
        !search ||
        log.ipAddress.includes(search) ||
        log.endpoint.toLowerCase().includes(search.toLowerCase()) ||
        log.user?.email.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase());

      return matchAction && matchSearch;
    });
  }, [logs, actionFilter, search]);

  if (isLoading) {
    return <TableSkeleton rows={8} columns={6} />;
  }

  return (
    <div className="notranslate space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground m-0">
              <span>Trazabilidad y Registro de Auditoría</span>
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <span>
              Registro inmutable de todas las mutaciones, accesos y operaciones realizadas en la plataforma.
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Actualizar Logs</span>
          </Button>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <AuditLogsToolbar
        search={search}
        onSearchChange={setSearch}
        actionFilter={actionFilter}
        onActionFilterChange={setActionFilter}
      />

      {/* Tabla de Logs */}
      <AuditLogsTable
        logs={filteredLogs}
        onSelectLog={setSelectedLog}
      />

      {/* Visor de Diferencias JSON */}
      <JsonDiffViewerModal
        log={selectedLog}
        open={Boolean(selectedLog)}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      />
    </div>
  );
}
