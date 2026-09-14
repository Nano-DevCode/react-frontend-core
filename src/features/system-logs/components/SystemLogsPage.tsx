import { useState } from 'react';
import {
  Server,
  Monitor,
  AlertOctagon,
  AlertTriangle,
  Info,
  RefreshCw,
  Search,
  Eye,
  Filter,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useSystemLogs, useSystemLogStats } from '../hooks/use-system-logs';
import { LogDetailModal } from './LogDetailModal';
import type {
  SystemLogRecord,
  LogSource,
  LogLevel,
  LogQueryFilters,
} from '../types/system-log.types';

export const SystemLogsPage = () => {
  const [filters, setFilters] = useState<LogQueryFilters>({
    page: 1,
    limit: 20,
    source: 'ALL',
    level: 'ALL',
    search: '',
  });

  const [selectedLog, setSelectedLog] = useState<SystemLogRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    data: logsData,
    isLoading: isLogsLoading,
    isFetching: isLogsFetching,
    refetch: refetchLogs,
  } = useSystemLogs(filters);

  const {
    data: stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useSystemLogStats();

  const handleRefresh = () => {
    void refetchLogs();
    void refetchStats();
  };

  const handleInspectLog = (log: SystemLogRecord) => {
    setSelectedLog(log);
    setModalOpen(true);
  };

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'FATAL':
        return (
          <Badge className="bg-red-600 hover:bg-red-700 text-white font-medium text-[11px] gap-1 shadow-xs">
            <AlertOctagon className="w-3 h-3" />
            FATAL
          </Badge>
        );
      case 'ERROR':
        return (
          <Badge variant="destructive" className="font-medium text-[11px] gap-1 shadow-xs">
            <AlertOctagon className="w-3 h-3" />
            ERROR
          </Badge>
        );
      case 'WARN':
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] gap-1">
            <AlertTriangle className="w-3 h-3" />
            WARN
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[11px] gap-1">
            <Info className="w-3 h-3" />
            INFO
          </Badge>
        );
    }
  };

  const getSourceBadge = (source: LogSource) => {
    if (source === 'BACKEND') {
      return (
        <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] gap-1">
          <Server className="w-3 h-3" />
          Backend
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] gap-1">
        <Monitor className="w-3 h-3" />
        Frontend
      </Badge>
    );
  };

  const totalPages = logsData?.totalPages || 1;
  const currentPage = filters.page || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Terminal className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Logs del Sistema
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Monitoreo y diagnóstico unificado en tiempo real de eventos del backend y cliente web.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLogsFetching}
            className="h-9 gap-1.5 shadow-xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLogsFetching ? 'animate-spin' : ''}`}
            />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Errores */}
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Errores (Últimas 24h)
              </p>
              <div className="text-2xl font-bold text-foreground mt-1">
                {isStatsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  stats?.totalErrors24h ?? 0
                )}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Distribución Fuentes */}
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Backend vs Frontend
              </p>
              <div className="flex items-center gap-2 mt-1">
                {isStatsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <span className="text-sm font-semibold text-indigo-500">
                      {stats?.sourceDistribution.backend ?? 0} Back
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-sm font-semibold text-emerald-500">
                      {stats?.sourceDistribution.frontend ?? 0} Front
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Server className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Advertencias */}
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Advertencias (WARN)
              </p>
              <div className="text-2xl font-bold text-foreground mt-1">
                {isStatsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  stats?.levelDistribution.warn ?? 0
                )}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Top Contextos Fallidos */}
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Top Contextos Fallidos
              </p>
              <div className="text-xs text-foreground mt-1 truncate">
                {isStatsLoading ? (
                  <Skeleton className="h-8 w-28" />
                ) : stats?.topFailingContexts && stats.topFailingContexts.length > 0 ? (
                  <span className="font-mono text-xs">
                    {stats.topFailingContexts[0]?.context} ({stats.topFailingContexts[0]?.count})
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Sin fallos recientes
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-muted text-muted-foreground border border-border/40">
              <Filter className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en mensaje o contexto..."
              value={filters.search || ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))
              }
              className="pl-9 h-9 text-xs rounded-xl bg-background"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Source Filter */}
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl border border-border/60">
            {(['ALL', 'BACKEND', 'FRONTEND'] as const).map((source) => (
              <button
                key={source}
                type="button"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, source, page: 1 }))
                }
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  filters.source === source
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {source === 'ALL' ? 'Todas' : source === 'BACKEND' ? 'Backend' : 'Frontend'}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl border border-border/60">
            {(['ALL', 'ERROR', 'WARN', 'INFO'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, level, page: 1 }))
                }
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  filters.level === level
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {level === 'ALL' ? 'Todos' : level}
              </button>
            ))}
          </div>

          {(filters.search || filters.source !== 'ALL' || filters.level !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setFilters({
                  page: 1,
                  limit: filters.limit,
                  source: 'ALL',
                  level: 'ALL',
                  search: '',
                })
              }
              className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[100px] text-xs">Nivel</TableHead>
              <TableHead className="w-[110px] text-xs">Origen</TableHead>
              <TableHead className="w-[180px] text-xs">Contexto</TableHead>
              <TableHead className="text-xs">Mensaje</TableHead>
              <TableHead className="w-[170px] text-xs">Fecha / Hora</TableHead>
              <TableHead className="w-[90px] text-right text-xs">Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLogsLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-16 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-7 w-12 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : !logsData?.data || logsData.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 opacity-80" />
                    <p className="text-sm font-medium text-foreground">
                      No se encontraron registros de logs
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      El sistema está operando con normalidad o los filtros aplicados no arrojaron resultados.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logsData.data.map((log) => (
                <TableRow
                  key={log.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer group"
                  onClick={() => handleInspectLog(log)}
                >
                  <TableCell>{getLevelBadge(log.level)}</TableCell>
                  <TableCell>{getSourceBadge(log.source)}</TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-foreground/80 font-medium truncate block max-w-[180px]">
                      {log.context}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-foreground font-medium line-clamp-1 break-all" title={log.message}>
                      {log.message}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInspectLog(log)}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border/60 text-xs text-muted-foreground">
          <div>
            <span>
              Página <strong className="text-foreground">{currentPage}</strong> de{' '}
              <strong className="text-foreground">{totalPages}</strong> (Total:{' '}
              {logsData?.total ?? 0} logs)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.max((prev.page || 1) - 1, 1),
                }))
              }
              disabled={currentPage <= 1 || isLogsLoading}
              className="h-8 gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.min((prev.page || 1) + 1, totalPages),
                }))
              }
              disabled={currentPage >= totalPages || isLogsLoading}
              className="h-8 gap-1"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <LogDetailModal
        log={selectedLog}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default SystemLogsPage;
