import { FileDiff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuditLogRecord } from '../types/audit.types';

interface AuditLogsTableProps {
  logs: AuditLogRecord[];
  onSelectLog: (log: AuditLogRecord) => void;
}

export const AuditLogsTable = ({ logs, onSelectLog }: AuditLogsTableProps) => {
  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'user';
      case 'UPDATE_USER':
        return 'admin';
      case 'DELETE_FILE':
        return 'destructive';
      default:
        return 'success';
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm notranslate">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/60 border-b border-border/60 text-muted-foreground">
            <tr>
              <th className="p-3.5 font-semibold"><span>Acción</span></th>
              <th className="p-3.5 font-semibold"><span>Responsable</span></th>
              <th className="p-3.5 font-semibold"><span>Endpoint</span></th>
              <th className="p-3.5 font-semibold"><span>Dirección IP</span></th>
              <th className="p-3.5 font-semibold"><span>Fecha / Hora</span></th>
              <th className="p-3.5 font-semibold text-right"><span>Inspección</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  <span>No se encontraron eventos de auditoría coincidentes.</span>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onSelectLog(log)}
                >
                  <td className="p-3.5">
                    <Badge
                      variant={getActionBadgeVariant(log.action)}
                      className="font-mono text-[10px]"
                    >
                      <span>{log.action}</span>
                    </Badge>
                  </td>

                  <td className="p-3.5 font-medium text-foreground">
                    <div className="flex flex-col">
                      <span>{log.user?.email || 'Sistema'}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        <span>{log.user?.name || ''}</span>
                      </span>
                    </div>
                  </td>

                  <td className="p-3.5 font-mono text-[11px] text-muted-foreground">
                    <span className="font-bold text-foreground mr-1">
                      <span>{log.method}</span>
                    </span>
                    <span>{log.endpoint}</span>
                  </td>

                  <td className="p-3.5 font-mono text-[11px] text-muted-foreground">
                    <span>{log.ipAddress}</span>
                  </td>

                  <td className="p-3.5 text-muted-foreground font-mono text-[11px]">
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </td>

                  <td className="p-3.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLog(log);
                      }}
                      className="h-7 text-xs text-primary gap-1"
                    >
                      <FileDiff className="h-3.5 w-3.5" />
                      <span>Ver Diff</span>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

