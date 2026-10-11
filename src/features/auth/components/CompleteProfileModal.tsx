import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldAlert, Loader2, UserCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/use-auth-store';
import { useUpdateProfileMutation } from '../hooks/use-auth';

const completeProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre(s) es obligatorio y debe tener al menos 2 caracteres'),
  firstLastName: z
    .string()
    .min(2, 'El primer apellido es obligatorio y debe tener al menos 2 caracteres'),
  secondLastName: z
    .string()
    .min(2, 'El segundo apellido es obligatorio y debe tener al menos 2 caracteres'),
});

type CompleteProfileFormValues = z.infer<typeof completeProfileSchema>;

export const CompleteProfileModal = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { mutate: updateProfile, isPending } = useUpdateProfileMutation();

  const isOpen = Boolean(isAuthenticated && user && user.isProfileComplete === false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CompleteProfileFormValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      firstName: '',
      firstLastName: '',
      secondLastName: '',
    },
  });

  useEffect(() => {
    if (user && user.isProfileComplete === false) {
      // Intentar pre-llenar inteligentemente si existe algún nombre
      const nameParts = (user.name || '').trim().split(/\s+/);
      const preFirstName = nameParts[0] || '';
      const preFirstLastName = nameParts[1] || '';
      const preSecondLastName = nameParts.slice(2).join(' ') || '';

      reset({
        firstName: preFirstName,
        firstLastName: preFirstLastName,
        secondLastName: preSecondLastName,
      });
    }
  }, [user, reset]);

  const firstNameValue = watch('firstName');
  const firstLastNameValue = watch('firstLastName');
  const secondLastNameValue = watch('secondLastName');
  const autoFullName = [firstNameValue, firstLastNameValue, secondLastNameValue]
    .filter(Boolean)
    .join(' ')
    .trim();

  const onSubmit = (values: CompleteProfileFormValues) => {
    updateProfile({
      firstName: values.firstName.trim(),
      firstLastName: values.firstLastName.trim(),
      secondLastName: values.secondLastName.trim(),
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="notranslate max-w-md border-primary/30 sm:rounded-2xl shadow-2xl [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto sm:mx-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            <span>Completar Datos Obligatorios</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            <span>
              Para cumplir con las políticas institucionales y de auditoría de la plataforma, es obligatorio especificar tu Nombre(s), Primer Apellido y Segundo Apellido antes de continuar.
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Nombre(s) */}
          <div className="space-y-1.5">
            <Label htmlFor="complete-firstName" className="text-xs font-semibold">
              <span>Nombre(s) *</span>
            </Label>
            <Input
              id="complete-firstName"
              placeholder="Ej. Juan Carlos"
              disabled={isPending}
              {...register('firstName')}
            />
            {errors.firstName && (
              <span className="text-[11px] text-destructive font-medium">
                <span>{errors.firstName.message}</span>
              </span>
            )}
          </div>

          {/* Primer y Segundo Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="complete-firstLastName" className="text-xs font-semibold">
                <span>Primer Apellido *</span>
              </Label>
              <Input
                id="complete-firstLastName"
                placeholder="Ej. Pérez"
                disabled={isPending}
                {...register('firstLastName')}
              />
              {errors.firstLastName && (
                <span className="text-[11px] text-destructive font-medium">
                  <span>{errors.firstLastName.message}</span>
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="complete-secondLastName" className="text-xs font-semibold">
                <span>Segundo Apellido *</span>
              </Label>
              <Input
                id="complete-secondLastName"
                placeholder="Ej. Gómez"
                disabled={isPending}
                {...register('secondLastName')}
              />
              {errors.secondLastName && (
                <span className="text-[11px] text-destructive font-medium">
                  <span>{errors.secondLastName.message}</span>
                </span>
              )}
            </div>
          </div>

          {/* Vista previa en tiempo real del nombre auto-generado */}
          {autoFullName && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs flex items-center justify-between">
              <span className="text-muted-foreground">Nombre completo resultante:</span>
              <span className="font-semibold text-primary">{autoFullName}</span>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="default"
              className="w-full h-10 gap-2"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Guardando datos...</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  <span>Confirmar y Guardar Perfil</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

