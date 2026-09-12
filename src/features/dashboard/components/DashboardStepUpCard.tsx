import { Lock, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardStepUpCardProps {
  onTriggerCriticalAction: () => void;
}

export const DashboardStepUpCard = ({
  onTriggerCriticalAction,
}: DashboardStepUpCardProps) => {
  return (
    <Card className="border-amber-500/30 bg-amber-500/5 hover-lift">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <div className="p-1.5 rounded-lg bg-amber-500/15">
              <Lock className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-bold">
              <span>Demostración de Step-Up Authentication (Acciones Críticas)</span>
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="text-amber-600 dark:text-amber-400 border-amber-500/40 text-[10px] font-mono"
          >
            <span>POST /auth/critical-action</span>
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          <span>Prueba la elevación de privilegios en tiempo real. Al hacer clic, el hook</span>{' '}
          <code className="font-mono font-semibold text-foreground bg-muted/60 px-1 py-0.5 rounded">
            useStepUpAuth()
          </code>{' '}
          <span>despliega un modal pidiendo tu código TOTP e inyecta la cabecera</span>{' '}
          <code className="font-mono font-semibold text-foreground bg-muted/60 px-1 py-0.5 rounded">
            x-2fa-code
          </code>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="default"
          size="sm"
          onClick={onTriggerCriticalAction}
          className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs shadow-md shadow-amber-600/20"
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Ejecutar Acción Crítica con Step-Up 2FA</span>
        </Button>
      </CardContent>
    </Card>
  );
};

