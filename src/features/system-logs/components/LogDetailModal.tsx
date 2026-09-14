import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Copy,
  Check,
  Server,
  Monitor,
  AlertOctagon,
  AlertTriangle,
  Info,
  Calendar,
  User,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import type { SystemLogRecord } from '../types/system-log.types';

interface LogDetailModalProps {
  log: SystemLogRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LogDetailModal = ({
  log,
  open,
  onOpenChange,
}: LogDetailModalProps) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!log) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'FATAL':
        return (
          <Badge className="bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1 shadow-sm">
            <AlertOctagon className="w-3.5 h-3.5" />
            FATAL
          </Badge>
        );
      case 'ERROR':
        return (
          <Badge variant="destructive" className="font-semibold flex items-center gap-1 shadow-sm">
            <AlertOctagon className="w-3.5 h-3.5" />
            ERROR
          </Badge>
        );
      case 'WARN':
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            WARN
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            INFO
          </Badge>
        );
    }
  };

  const getSourceBadge = (source: string) => {
    if (source === 'BACKEND') {
      return (
        <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
          <Server className="w-3.5 h-3.5" />
          Backend
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
        <Monitor className="w-3.5 h-3.5" />
        Frontend
      </Badge>
    );
  };

  const formattedMetadata = log.metadata
    ? JSON.stringify(log.metadata, null, 2)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader className="space-y-2 border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {getLevelBadge(log.level)}
              {getSourceBadge(log.source)}
              <Badge variant="secondary" className="font-mono text-xs flex items-center gap-1">
                <Layers className="w-3 h-3 text-muted-foreground" />
                {log.context}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(JSON.stringify(log, null, 2), 'all')}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {copiedKey === 'all' ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              Copiar Todo el Log
            </Button>
          </div>

          <DialogTitle className="text-base sm:text-lg font-bold text-foreground leading-snug break-words">
            {log.message}
          </DialogTitle>

          <DialogDescription className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(log.createdAt).toLocaleString()}
            </span>
            {log.userId && (
              <span className="flex items-center gap-1 font-mono">
                <User className="w-3.5 h-3.5" />
                User: {log.userId}
              </span>
            )}
            <span className="font-mono text-[11px] text-muted-foreground/80">
              ID: {log.id}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Metadata Section */}
          {formattedMetadata && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Metadatos (JSON)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(formattedMetadata, 'meta')}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  {copiedKey === 'meta' ? (
                    <Check className="w-3 h-3 text-emerald-500 mr-1" />
                  ) : (
                    <Copy className="w-3 h-3 mr-1" />
                  )}
                  Copiar JSON
                </Button>
              </div>
              <pre className="p-3 bg-muted/60 dark:bg-zinc-950/70 border border-border/70 rounded-xl text-xs font-mono overflow-x-auto text-foreground/90 max-h-48 scrollbar-thin">
                {formattedMetadata}
              </pre>
            </div>
          )}

          {/* Stack Trace Section */}
          {log.stackTrace ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Rastreo de Pila (Stack Trace)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(log.stackTrace!, 'stack')}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  {copiedKey === 'stack' ? (
                    <Check className="w-3 h-3 text-emerald-500 mr-1" />
                  ) : (
                    <Copy className="w-3 h-3 mr-1" />
                  )}
                  Copiar Stack
                </Button>
              </div>
              <pre className="p-3 bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-xl text-xs font-mono overflow-x-auto max-h-64 leading-relaxed whitespace-pre-wrap break-all scrollbar-thin">
                {log.stackTrace}
              </pre>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center text-xs text-muted-foreground">
              No se adjuntó información de stack trace para este evento.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

