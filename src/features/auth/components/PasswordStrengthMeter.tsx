import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password?: string;
}

export const PasswordStrengthMeter = ({ password = '' }: PasswordStrengthMeterProps) => {
  const { score, label, colorClass } = useMemo(() => {
    if (!password) {
      return { score: 0, label: 'Introduce tu contraseña', colorClass: 'bg-muted' };
    }

    let currentScore = 0;
    if (password.length >= 8) currentScore += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) currentScore += 1;
    if (/\d/.test(password)) currentScore += 1;
    if (/[^A-Za-z0-9]/.test(password)) currentScore += 1;

    switch (currentScore) {
      case 1:
        return { score: 1, label: 'Débil (añade mayúsculas y números)', colorClass: 'bg-red-500' };
      case 2:
        return { score: 2, label: 'Aceptable (añade símbolos)', colorClass: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Fuerte (buena entropía)', colorClass: 'bg-blue-500' };
      case 4:
        return { score: 4, label: 'Excelente (máxima seguridad)', colorClass: 'bg-emerald-500' };
      default:
        return { score: 0, label: 'Mínimo 8 caracteres', colorClass: 'bg-red-400' };
    }
  }, [password]);

  return (
    <div className="notranslate w-full space-y-1.5 pt-1">
      <div className="flex gap-1.5 h-1.5 w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-full flex-1 rounded-full transition-all duration-300',
              i < score ? colorClass : 'bg-muted/70'
            )}
          />
        ))}
      </div>
      <div className="flex justify-between items-center text-[11px] text-muted-foreground">
        <span><span>Seguridad:</span></span>
        <span className="font-medium text-foreground"><span>{label}</span></span>
      </div>
    </div>
  );
};

