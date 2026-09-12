import { useState } from 'react';
import { KeyRound, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/use-auth-store';
import {
  useTwoFactorStatusQuery,
  useTwoFactorGenerateQuery,
  useTwoFactorTurnOnMutation,
  useTwoFactorTurnOffMutation,
} from '../hooks/use-two-factor';
import { TwoFactorActiveView } from './TwoFactorActiveView';
import { TwoFactorSetupView } from './TwoFactorSetupView';
import { TwoFactorDisableModal } from './TwoFactorDisableModal';

export default function TwoFactorSetupPage() {
  const user = useAuthStore((state) => state.user);
  const { data: statusData, isError } = useTwoFactorStatusQuery();

  const isEnabled =
    !isError && statusData !== undefined
      ? statusData.isEnabled
      : Boolean(user?.isTwoFactorEnabled);

  const [showTurnOffDialog, setShowTurnOffDialog] = useState(false);

  const {
    data: secretData,
    isLoading: isLoadingSecret,
    refetch: regenerateSecret,
  } = useTwoFactorGenerateQuery(!isEnabled);

  const { mutate: turnOn, isPending: isTurningOn } = useTwoFactorTurnOnMutation();
  const { mutate: turnOff, isPending: isTurningOff } = useTwoFactorTurnOffMutation();

  const handleTurnOn = (code: string) => {
    turnOn({ code });
  };

  const handleTurnOff = (code: string) => {
    turnOff(
      { code },
      {
        onSuccess: () => {
          setShowTurnOffDialog(false);
        },
      }
    );
  };

  return (
    <div className="notranslate space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground m-0">
                <span>Autenticación de Doble Factor (TOTP)</span>
              </h2>
              <Badge variant={isEnabled ? 'success' : 'warning'}>
                <span>{isEnabled ? 'Habilitado' : 'Deshabilitado'}</span>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span>Protege tu cuenta institucional exigiendo un código temporal de 6 dígitos además de tu contraseña.</span>
            </p>
          </div>
        </div>

        {isEnabled && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowTurnOffDialog(true)}
            className="shrink-0"
          >
            <ShieldOff className="mr-2 h-4 w-4" />
            <span>Desactivar 2FA</span>
          </Button>
        )}
      </div>

      {/* Vista Dinámica según Estado Activo o de Configuración */}
      {isEnabled ? (
        <TwoFactorActiveView userEmail={user?.email} />
      ) : (
        <TwoFactorSetupView
          secretData={secretData}
          isLoadingSecret={isLoadingSecret}
          onRegenerateSecret={() => regenerateSecret()}
          onTurnOn={handleTurnOn}
          isTurningOn={isTurningOn}
        />
      )}

      {/* Modal de Desactivación */}
      <TwoFactorDisableModal
        open={showTurnOffDialog}
        onOpenChange={setShowTurnOffDialog}
        onConfirm={handleTurnOff}
        isPending={isTurningOff}
      />
    </div>
  );
}
