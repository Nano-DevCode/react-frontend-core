import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileDiff, Globe, Calendar, User, Terminal } from 'lucide-react';
import { AuditLogRecord } from '../types/audit.types';

interface JsonDiffViewerModalProps {
  log: AuditLogRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JsonDiffViewerModal = ({
  log,
  open,
  onOpenChange,
}: JsonDiffViewerModalProps) => {
  if (!log) return null;

  // Extract before / after states from log.details
  const beforeState =
    log.details && 'before' in log.details ? log.details.before : null;
  const afterState =
    log.details && 'after' in log.details ? log.details.after : log.details;

  const beforeJson = beforeState ? JSON.stringify(beforeState, null, 2) : '{\n  // Sin estado anterior\n}';
  const afterJson = afterState ? JSON.stringify(afterState, null, 2) : '{\n  // Sin estado nuevo\n}';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="notranslate max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <FileDiff className="h-5 w-5 text-primary" />
            <DialogTitle className="text-base font-bold">
              <span>Visor de Diferencias JSON (Side-by-Side Diff)</span>
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            <span>Trazabilidad de la operación criptográfica ejecutada sobre la entidad</span>{' '}
            <strong className="text-foreground">{log.entity || 'general'}</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* Metadatos de la Trazabilidad */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-xl text-xs border border-border/50 shrink-0">
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Terminal className="h-3 w-3" /> <span>Acción:</span>
            </span>
            <Badge variant="default" className="text-[10px] font-mono">
              <span>{log.action}</span>
            </Badge>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" /> <span>Responsable:</span>
            </span>
            <span className="font-semibold text-foreground truncate block">
              <span>{log.user?.email || 'Sistema (Automático)'}</span>
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" /> <span>IP & Cliente:</span>
            </span>
            <span className="font-mono text-[11px] truncate block">
              <span>{log.ipAddress}</span>
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> <span>Fecha / Hora:</span>
            </span>
            <span className="font-mono text-[11px] truncate block">
              <span>{new Date(log.createdAt).toLocaleString()}</span>
            </span>
          </div>
        </div>

        {/* Comparador Side-by-Side */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Columna Izquierda: Estado Anterior */}
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-red-500/20 text-xs font-bold text-red-600 dark:text-red-400">
              <span><span>ESTADO ANTERIOR (-)</span></span>
              <span className="text-[10px] font-mono"><span>Valores previos</span></span>
            </div>
            <pre className="mt-2 flex-1 font-mono text-[11px] text-red-700 dark:text-red-300 overflow-x-auto whitespace-pre p-2 bg-red-950/10 rounded-lg">
              <code>{beforeJson}</code>
            </pre>
          </div>

          {/* Columna Derecha: Estado Nuevo */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span><span>ESTADO NUEVO (+)</span></span>
              <span className="text-[10px] font-mono"><span>Valores aplicados</span></span>
            </div>
            <pre className="mt-2 flex-1 font-mono text-[11px] text-emerald-700 dark:text-emerald-300 overflow-x-auto whitespace-pre p-2 bg-emerald-950/10 rounded-lg">
              <code>{afterJson}</code>
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

