import { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useTwoFactorAuthenticateMutation } from '../hooks/use-two-factor';

interface TwoFactorChallengeModalProps {
  open: boolean;
  tempToken: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TwoFactorChallengeModal = ({
  open,
  tempToken,
  onSuccess,
  onCancel,
}: TwoFactorChallengeModalProps) => {
  const [code, setCode] = useState('');
  const { mutate: authenticate, isPending } = useTwoFactorAuthenticateMutation();

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.length === 6) {
      authenticate(
        { tempToken, code },
        {
          onSuccess: () => {
            onSuccess();
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <DialogContent className="notranslate max-w-sm text-center">
        <DialogHeader className="items-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-bold">
            <span>Verificación en Dos Pasos</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            <span>Introduce el código de 6 dígitos generado por tu app de autenticación (Google Authenticator, Authy, etc.).</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4 py-3">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
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

          <div className="flex w-full gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
              className="flex-1"
            >
              <span>Cancelar</span>
            </Button>
            <Button
              type="submit"
              disabled={code.length !== 6 || isPending}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <span>Validar</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

