import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ShieldCheck, Lock, Mail, User, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { useRegisterMutation } from '../hooks/use-auth';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe contener al menos 2 caracteres').optional().or(z.literal('')),
  email: z.string().email('Ingresa un correo electrónico corporativo válido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres requeridos')
    .regex(/[A-Z]/, 'Debe incluir al menos una letra mayúscula')
    .regex(/[a-z]/, 'Debe incluir al menos una letra minúscula')
    .regex(/(?=.*[\d\W_])/, 'Debe incluir al menos un número o símbolo'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const passwordValue = watch('password');
  const { mutate: registerUser, isPending } = useRegisterMutation();

  const onSubmit = (values: RegisterFormValues) => {
    registerUser(
      {
        email: values.email,
        password: values.password,
        name: values.name || undefined,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
      }
    );
  };

  return (
    <div className="notranslate flex min-h-screen w-full flex-col justify-between p-6 sm:p-12 bg-background">
      <div className="flex justify-between items-center w-full max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="font-bold text-sm"><span>SaaS Enterprise</span></span>
        </div>
        <ThemeToggle />
      </div>

      <div className="mx-auto w-full max-w-md my-auto space-y-6">
        {isSuccess ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              <span>¡Cuenta Creada Exitosamente!</span>
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span>Hemos despachado un correo con tu enlace seguro de verificación. Por favor revisa tu bandeja de entrada o spam antes de iniciar sesión.</span>
            </p>
            <div className="pt-2">
              <Button onClick={() => navigate('/login')} className="w-full">
                <span>Ir al Inicio de Sesión</span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1.5 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                <span>Crear Cuenta Institucional</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                <span>Únete a la plataforma empresarial de control de accesos y archivos</span>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nombre */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">
                  <span>Nombre Completo (Opcional)</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Ej. Carlos Silva"
                    className="pl-9"
                    disabled={isPending}
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <span className="text-[11px] text-destructive font-medium">
                    <span>{errors.name.message}</span>
                  </span>
                )}
              </div>

              {/* Correo Electrónico */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">
                  <span>Correo Electrónico Corporativo</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="carlos.s@empresa.com"
                    className="pl-9"
                    disabled={isPending}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <span className="text-[11px] text-destructive font-medium">
                    <span>{errors.email.message}</span>
                  </span>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold">
                  <span>Contraseña Segura</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mín. 8 caracteres, mayúsculas, minúsculas y número o símbolo"
                    className="pl-9 pr-9"
                    disabled={isPending}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
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

                <PasswordStrengthMeter password={passwordValue} />
              </div>

              <Button
                type="submit"
                variant="shimmer"
                className="w-full h-10 mt-3"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Creando cuenta segura...</span>
                  </>
                ) : (
                  <span>Registrar Cuenta</span>
                )}
              </Button>
            </form>

            <div className="text-center text-xs text-muted-foreground">
              <span>¿Ya posees una cuenta registrada?</span>{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                <span>Inicia sesión aquí</span>
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="text-center text-[11px] text-muted-foreground">
        <span>Toda actividad de registro es monitoreada y resguardada criptográficamente.</span>
      </div>
    </div>
  );
}

