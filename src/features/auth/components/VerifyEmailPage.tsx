import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Mail, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVerifyEmailQuery, useResendVerificationMutation } from '../hooks/use-auth';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [resendEmail, setResendEmail] = useState('');

  const { data, isLoading, isError, error } = useVerifyEmailQuery(token);
  const { mutate: resend, isPending: isResending } = useResendVerificationMutation();

  const handleResend = (e: React.FormEvent) => {
    e.preventDefault();
    if (resendEmail) {
      resend({ email: resendEmail });
    }
  };

  const errorMessage =
    (error as AxiosError<ApiErrorResponse>)?.response?.data?.message ||
    'El token de verificación es inválido o ya ha expirado.';
  const displayError = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;

  return (
    <div className="notranslate flex min-h-screen items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/70 bg-card p-8 shadow-xl text-center">
        {token ? (
          isLoading ? (
            <div className="py-8 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <h2 className="text-lg font-semibold text-foreground">
                <span>Verificando tu correo electrónico...</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                <span>Por favor espera un instante mientras validamos tu token criptográfico.</span>
              </p>
            </div>
          ) : isError ? (
            <div className="space-y-4 py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                <span>Enlace Inválido o Expirado</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                <span>{displayError}</span>
              </p>

              {/* Formulario de Reenvío */}
              <form onSubmit={handleResend} className="space-y-3 pt-4 border-t border-border/50 text-left">
                <Label htmlFor="resendEmail" className="text-xs font-semibold">
                  <span>Reenviar enlace de verificación:</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="resendEmail"
                    type="email"
                    placeholder="tu-correo@empresa.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" disabled={isResending || !resendEmail} className="shrink-0">
                    {isResending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                <span>¡Correo Verificado con Éxito!</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                <span>{data?.message || 'Tu correo electrónico ha sido autenticado. Ya puedes acceder a todas las funcionalidades del sistema.'}</span>
              </p>
              <div className="pt-4">
                <Button asChild className="w-full">
                  <Link to="/login">
                    <span>Iniciar Sesión Ahora</span>
                  </Link>
                </Button>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-4 py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              <span>Verificación de Cuenta</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              <span>Ingresa tu correo para recibir un nuevo enlace de activación.</span>
            </p>

            <form onSubmit={handleResend} className="space-y-3 pt-2 text-left">
              <Label htmlFor="email" className="text-xs font-semibold">
                <span>Correo Electrónico</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu-correo@empresa.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={isResending || !resendEmail}>
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Despachando correo...</span>
                  </>
                ) : (
                  <span>Enviar Nuevo Enlace</span>
                )}
              </Button>
            </form>

            <div className="pt-2">
              <Link to="/login" className="text-xs text-primary hover:underline">
                <span>Volver al inicio de sesión</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

