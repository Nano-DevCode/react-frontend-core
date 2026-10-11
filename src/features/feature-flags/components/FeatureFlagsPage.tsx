import { useState } from 'react';
import { Flag, Play, CheckCircle, XCircle, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  useFeatureFlagsQuery,
  useToggleFeatureFlagMutation,
} from '../hooks/use-feature-flags';
import {
  fetchBetaFeatureAction,
  DEFAULT_FEATURE_FLAGS,
} from '../actions/feature-flags.actions';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { FeatureFlagRecord } from '../types/feature-flags.types';

export default function FeatureFlagsPage() {
  const { data: apiFlags, refetch, isFetching } = useFeatureFlagsQuery();
  const { mutate: toggleFlag } = useToggleFeatureFlagMutation();

  const [betaTestResult, setBetaTestResult] = useState<{
    status: 'idle' | 'testing' | 'success' | 'forbidden';
    data?: unknown;
  }>({ status: 'idle' });

  const flags: FeatureFlagRecord[] =
    Array.isArray(apiFlags) && apiFlags.length > 0 ? apiFlags : DEFAULT_FEATURE_FLAGS;

  const handleTestBetaEndpoint = async () => {
    setBetaTestResult({ status: 'testing' });
    try {
      const res = await fetchBetaFeatureAction();
      setBetaTestResult({ status: 'success', data: res });
      toast.success('¡Endpoint /beta-feature respondió { ok: true }!');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: unknown } })?.response?.status;
      const data = (err as { response?: { data?: unknown } })?.response?.data || {
        message: '403 Forbidden - Funcionalidad Deshabilitada',
      };
      setBetaTestResult({
        status: 'forbidden',
        data,
      });
      if (status === 403) {
        toast.error('Acceso bloqueado: la bandera BETA_FEATURE está desactivada en el backend');
      }
    }
  };

  return (
    <div className="notranslate space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground m-0">
              <span>Gestión de Feature Flags en Tiempo Real</span>
            </h2>
            <Badge variant="admin" className="text-xs">
              <span>Redis Cache + Fallback PostgreSQL</span>
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <span>Habilita o deshabilita capacidades del sistema al instante sin necesidad de reiniciar el servidor backend ni desplegar código.</span>
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-9 gap-1.5 text-xs self-start sm:self-auto"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
          <span>{isFetching ? 'Actualizando...' : 'Refrescar Banderas'}</span>
        </Button>
      </div>

      {/* Lista de Flags */}
      <div className="grid grid-cols-1 gap-4">
        {flags.map((flag) => {
          const flagKey = flag?.key || 'FLAG';
          const isBeta = typeof flagKey === 'string' && flagKey.toUpperCase().includes('BETA');
          const isEnabled = Boolean(flag?.isEnabled);
          const rolloutPercentage = flag?.rules?.percentage ?? (isEnabled ? 100 : 0);
          const allowedRoles = Array.isArray(flag?.rules?.allowedRoles) ? flag.rules.allowedRoles : [];

          return (
            <Card key={flagKey} className="border-border/80 hover-lift bg-card/90 shadow-sm">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Flag className="h-4 w-4" />
                    </div>
                    <span className="font-mono text-sm font-bold text-foreground">
                      <span>{flagKey}</span>
                    </span>
                    <Badge variant={isEnabled ? 'success' : 'outline'} className="text-[10px]">
                      <span>{isEnabled ? 'Habilitada' : 'Apagada'}</span>
                    </Badge>
                    <Badge variant={isBeta ? 'admin' : 'secondary'} className="text-[10px]">
                      <span>{isBeta ? 'En Beta' : 'Producción'}</span>
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed pl-0 sm:pl-10">
                    <span>{flag?.description || 'Sin descripción provista.'}</span>
                  </p>

                  {/* Reglas de Rollout */}
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground font-mono pl-0 sm:pl-10">
                    <span className="rounded bg-muted/60 px-1.5 py-0.5">
                      <span>Rollout:</span> <strong className="text-foreground">{rolloutPercentage}%</strong>
                    </span>
                    {allowedRoles.length > 0 && (
                      <span className="rounded bg-muted/60 px-1.5 py-0.5">
                        <span>Roles:</span> <strong className="text-foreground">{allowedRoles.join(', ')}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0 p-2 rounded-xl bg-muted/30 border border-border/50">
                  <span className="text-xs font-semibold text-foreground select-none">
                    <span>{isEnabled ? 'Activado' : 'Desactivado'}</span>
                  </span>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) =>
                      toggleFlag({ key: flagKey, isEnabled: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tarjeta Interactiva: Probador en Vivo de /beta-feature */}
      <Card className="border-primary/30 bg-primary/5 hover-lift shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Sparkles className="h-4 w-4" />
            <CardTitle className="text-sm font-bold">
              <span>Probador de Integración: Endpoint /beta-feature</span>
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            <span>Este endpoint está protegido en el backend por el decorador</span>{' '}
            <code className="rounded bg-primary/10 px-1 font-mono text-primary font-semibold">@RequireFeature('BETA_FEATURE')</code>.
            <span> Si la bandera está encendida arriba, la petición responderá 200 OK; si la apagas, responderá 403 Forbidden al instante.</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              onClick={handleTestBetaEndpoint}
              disabled={betaTestResult.status === 'testing'}
              variant="default"
              size="sm"
              className="h-9 gap-2 text-xs"
            >
              {betaTestResult.status === 'testing' ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Consultando GET /beta-feature...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Disparar Petición GET /beta-feature</span>
                </>
              )}
            </Button>

            {betaTestResult.status === 'success' && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                <span>Respuesta 200 OK: {JSON.stringify(betaTestResult.data)}</span>
              </div>
            )}

            {betaTestResult.status === 'forbidden' && (
              <div className="flex items-center gap-2 text-xs font-semibold text-destructive">
                <XCircle className="h-4 w-4" />
                <span>Respuesta 403 Forbidden: Bloqueado por Guard de Feature Flag</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

