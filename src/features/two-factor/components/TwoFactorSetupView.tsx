import { useState } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Loader2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { toast } from 'sonner';
import type { TwoFactorGenerateResponse } from '@/types/two-factor.types';

interface TwoFactorSetupViewProps {
  secretData?: TwoFactorGenerateResponse;
  isLoadingSecret: boolean;
  onRegenerateSecret: () => void;
  onTurnOn: (code: string) => void;
  isTurningOn: boolean;
}

export const TwoFactorSetupView = ({
  secretData,
  isLoadingSecret,
  onRegenerateSecret,
  onTurnOn,
  isTurningOn,
}: TwoFactorSetupViewProps) => {
  const [otpCode, setOtpCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Extract secret key from otpauth URL if available
  const secretKey =
    secretData?.otpauthUrl?.match(/secret=([A-Z0-9]+)/i)?.[1] ||
    'JBSWY3DPEHPK3PXP';

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    toast.success('Clave secreta copiada al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length === 6) {
      onTurnOn(otpCode);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 notranslate">
      {/* Tarjeta 1: QR y Clave Manual */}
      <Card className="flex flex-col items-center p-6 text-center justify-between border-border/80 hover-lift bg-card/90 shadow-sm">
        <CardHeader className="p-0 mb-4 w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary font-mono">
              <span>PASO 01</span>
            </span>
            <span className="text-[11px] text-muted-foreground">
              <span>App Autenticadora</span>
            </span>
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            <span>Escanea el Código QR</span>
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            <span>
              Abre Google Authenticator, Authy o 1Password y apunta la cámara a la imagen inferior.
            </span>
          </CardDescription>
        </CardHeader>

        <div className="relative my-2 rounded-3xl border-2 border-primary/30 p-4 bg-white shadow-md ring-4 ring-primary/5">
          {isLoadingSecret ? (
            <div className="flex h-48 w-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : secretData?.qrCodeDataUrl ? (
            <img
              src={secretData.qrCodeDataUrl}
              alt="Código QR de autenticación 2FA"
              className="h-48 w-48 object-contain rounded-xl"
            />
          ) : (
            <div className="flex h-48 w-48 flex-col items-center justify-center text-xs text-muted-foreground">
              <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
              <span>Error generando QR</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerateSecret}
                className="mt-2 text-xs"
              >
                <RefreshCw className="mr-1 h-3 w-3" /> <span>Reintentar</span>
              </Button>
            </div>
          )}
        </div>

        <div className="w-full space-y-2 mt-4">
          <p className="text-[11px] text-muted-foreground">
            <span>¿No puedes escanear? Ingresa esta clave secreta manualmente:</span>
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-2 text-xs font-mono">
            <span className="flex-1 truncate tracking-wider font-semibold select-all text-foreground">
              <span>{secretKey}</span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 cursor-pointer"
              onClick={handleCopySecret}
              aria-label="Copiar clave secreta"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Tarjeta 2: Verificación e InputOTP */}
      <Card className="flex flex-col justify-between p-6 border-border/80 hover-lift bg-card/90 shadow-sm">
        <CardHeader className="p-0 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary font-mono">
              <span>PASO 02</span>
            </span>
            <span className="text-[11px] text-muted-foreground">
              <span>Sincronización TOTP</span>
            </span>
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            <span>Confirma el Código de 6 Dígitos</span>
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            <span>
              Ingresa el código temporal rotativo que ahora muestra tu aplicación móvil.
            </span>
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6 my-auto py-4">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button
            type="submit"
            disabled={otpCode.length !== 6 || isTurningOn}
            className="w-full h-10 text-xs font-semibold shadow-md shadow-primary/20 cursor-pointer"
          >
            {isTurningOn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Verificando y Activando...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Habilitar 2FA</span>
              </>
            )}
          </Button>
        </form>

        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-[11px] text-muted-foreground space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span>Nota Importante:</span>
          </div>
          <p>
            <span>
              Una vez activado, será obligatorio introducir el código TOTP cada vez que inicies sesión o ejecutes acciones críticas.
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
};

