import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

interface TwoFactorDisableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (code: string) => void;
  isPending: boolean;
}

export const TwoFactorDisableModal = ({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: TwoFactorDisableModalProps) => {
  const [code, setCode] = useState('');

  const handleClose = () => {
    setCode('');
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onConfirm(code);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="notranslate max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle className="text-base font-bold">
              <span>¿Desactivar Autenticación de Doble Factor?</span>
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            <span>
              Tu cuenta quedará protegida únicamente con contraseña. Para confirmar la desactivación, introduce el código de 6 dígitos de tu aplicación.
            </span>
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

          <DialogFooter className="w-full flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
              className="flex-1"
            >
              <span>Cancelar</span>
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={code.length !== 6 || isPending}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Desactivando...</span>
                </>
              ) : (
                <span>Confirmar Desactivación</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

