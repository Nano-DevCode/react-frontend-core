import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ShieldCheck, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { useLoginMutation } from '../hooks/use-auth';
import { AuthHeroBanner } from './AuthHeroBanner';
import { TwoFactorChallengeModal } from '@/features/two-factor/components/TwoFactorChallengeModal';
import { SocialLoginButtons } from './SocialLoginButtons';
import { syncUserSession } from '@/api/auth-session';

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  trustDevice: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [challengeTempToken, setChallengeTempToken] = useState<string | null>(null);
  const [isOauth2FaOpen, setIsOauth2FaOpen] = useState(false);
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const [rateLimitTimer, setRateLimitTimer] = useState<number | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get('oauth') === 'success') {
      setIsProcessingOAuth(true);
      syncUserSession()
        .then(() => {
          toast.success('¡Sesión iniciada con éxito!');
          navigate(from, { replace: true });
        })
        .catch(() => {
          toast.error('Error al sincronizar la sesión federada.');
        })
        .finally(() => {
          setIsProcessingOAuth(false);
        });
    } else if (params.get('require2FA') === 'true') {
      setIsOauth2FaOpen(true);
    } else if (params.has('error')) {
      const errorMsg = params.get('error') || 'Error en la autenticación social';
      toast.error(decodeURIComponent(errorMsg));
      navigate('/login', { replace: true });
    }
  }, [location.search, navigate, from]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      trustDevice: false,
    },
  });

  const passwordValue = watch('password');
  const trustDeviceValue = watch('trustDevice');

  const { mutate: login, isPending } = useLoginMutation();

  const onSubmit = (values: LoginFormValues) => {
    login(values, {
      onSuccess: (data) => {
        if ('require2FA' in data && data.require2FA) {
          setChallengeTempToken(data.tempToken);
        } else {
          navigate(from, { replace: true });
        }
      },
      onError: (err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 429) {
          setRateLimitTimer(60);
          const interval = setInterval(() => {
            setRateLimitTimer((prev) => {
              if (!prev || prev <= 1) {
                clearInterval(interval);
                return null;
              }
              return prev - 1;
            });
          }, 1000);
        }
      },
    });
  };

  return (
    <div className="notranslate flex min-h-screen w-full">
      {/* Mitad Izquierda: Branding Compartido */}
      <AuthHeroBanner />

      {/* Mitad Derecha: Formulario de Acceso */}
      <div className="relative flex w-full flex-col justify-between p-6 sm:p-12 lg:w-1/2 bg-background/50 backdrop-blur-xs">
        <div className="flex justify-between items-center w-full">
          <div className="lg:hidden flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-bold text-sm"><span>SaaS Enterprise</span></span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm my-auto space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl shadow-slate-900/5 dark:shadow-purple-950/10 space-y-5">
            <div className="space-y-1.5 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                <span>Iniciar Sesión</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                <span>Ingresa tus credenciales autorizadas para acceder a la plataforma</span>
              </p>
            </div>

            {/* Banner de Rate Limit Throttling (429) */}
            {rateLimitTimer !== null && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  <span>Demasiados intentos. Espera</span> <strong><span>{rateLimitTimer}s</span></strong> <span>antes de volver a intentar.</span>
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Campo Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">
                  <span>Correo Electrónico</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@empresa.com"
                    className="pl-9 h-10 text-xs focus-visible:ring-2 focus-visible:ring-primary/30"
                    disabled={isPending || rateLimitTimer !== null}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <span className="text-[11px] text-destructive font-medium">
                    <span>{errors.email.message}</span>
                  </span>
                )}
              </div>

              {/* Campo Contraseña con visor y Medidor de Fuerza */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-semibold">
                    <span>Contraseña</span>
                  </Label>
                  <Link
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Por favor contacta al administrador del sistema para restablecer tu acceso.');
                    }}
                    className="text-[11px] text-primary hover:underline"
                  >
                    <span>¿Olvidaste tu contraseña?</span>
                  </Link>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    className="pl-9 pr-9 h-10 text-xs focus-visible:ring-2 focus-visible:ring-primary/30"
                    disabled={isPending || rateLimitTimer !== null}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {errors.password && (
                  <span className="text-[11px] text-destructive font-medium">
                    <span>{errors.password.message}</span>
                  </span>
                )}

                {/* Medidor de Fuerza */}
                <PasswordStrengthMeter password={passwordValue} />
              </div>

              {/* Switch Recordar este dispositivo */}
              <div className="flex items-center justify-between pt-1">
                <div className="space-y-0.5">
                  <Label htmlFor="trustDevice" className="text-xs cursor-pointer">
                    <span>Recordar este equipo</span>
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    <span>Mantiene la confianza del dispositivo por 30 días</span>
                  </p>
                </div>
                <Switch
                  id="trustDevice"
                  checked={trustDeviceValue}
                  onCheckedChange={(checked) => setValue('trustDevice', checked)}
                  disabled={isPending}
                />
              </div>

              {/* Botón Shimmer Submit */}
              <Button
                type="submit"
                variant="shimmer"
                className="w-full h-11 text-xs font-semibold mt-2 shadow-md shadow-primary/20"
                disabled={isPending || rateLimitTimer !== null || isProcessingOAuth}
              >
                {isPending || isProcessingOAuth ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>
                      {isProcessingOAuth
                        ? 'Sincronizando acceso social...'
                        : 'Validando credenciales...'}
                    </span>
                  </>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </Button>
            </form>

            {/* Botones de Inicio Social (Google / Facebook) */}
            <SocialLoginButtons />
          </div>

          {/* Enlace a Registro */}
          <div className="text-center text-xs text-muted-foreground pt-1">
            <span>¿No tienes una cuenta aún?</span>{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              <span>Registrarse aquí</span>
            </Link>
          </div>
        </div>

        <div className="text-center text-[11px] text-muted-foreground">
          <span>Acceso restringido a personal autorizado y auditado.</span>
        </div>
      </div>

      {/* Modal Desafío 2FA (credenciales o federado OAuth) */}
      {(challengeTempToken || isOauth2FaOpen) && (
        <TwoFactorChallengeModal
          open={Boolean(challengeTempToken || isOauth2FaOpen)}
          tempToken={challengeTempToken}
          onSuccess={() => {
            setChallengeTempToken(null);
            setIsOauth2FaOpen(false);
            navigate(from, { replace: true });
          }}
          onCancel={() => {
            setChallengeTempToken(null);
            setIsOauth2FaOpen(false);
          }}
        />
      )}
    </div>
  );
}

