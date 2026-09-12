import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface HealthDashboardHeaderProps {
  isOk: boolean;
  autoRefresh: boolean;
  onAutoRefreshChange: (checked: boolean) => void;
  onRefetch: () => void;
  isFetching: boolean;
}

export const HealthDashboardHeader = ({
  isOk,
  autoRefresh,
  onAutoRefreshChange,
  onRefetch,
  isFetching,
}: HealthDashboardHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground m-0">
            <span>Observabilidad y Estado de Salud</span>
          </h2>
          <Badge
            variant={isOk ? 'success' : 'destructive'}
            className="gap-1 px-2 py-0.5 text-xs font-semibold"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isOk ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span>{isOk ? 'Sistemas Operacionales' : 'Degradación Detectada'}</span>
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          <span>Pings y métricas en vivo conectando a PostgreSQL, Redis y SeaweedFS mediante NestJS Terminus.</span>
        </p>
      </div>

      {/* Controles: Auto-Refresh y Botón */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id="auto-refresh-health"
            checked={autoRefresh}
            onCheckedChange={onAutoRefreshChange}
          />
          <label
            htmlFor="auto-refresh-health"
            className="text-xs font-medium cursor-pointer text-muted-foreground select-none"
          >
            <span>Auto-refresh (30s)</span>
          </label>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefetch}
          disabled={isFetching}
          className="h-9 gap-1.5 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refrescar</span>
        </Button>
      </div>
    </div>
  );
};

