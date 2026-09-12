import { useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
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

interface StepUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (code: string) => Promise<void> | void;
  onCancel: () => void;
  isPending?: boolean;
}

export const StepUpModal = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isPending = false,
}: StepUpModalProps) => {
  const [code, setCode] = useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.length === 6) {
      await onConfirm(code);
      setCode('');
    }
  };

  const handleClose = () => {
    setCode('');
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="notranslate max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="relative mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
            <ShieldAlert className="h-7 w-7" />
          </div>

          <DialogTitle className="text-lg font-bold">
            <span>Autorización Requerida (Step-Up 2FA)</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground max-w-xs">
            <span>Esta acción es de alto riesgo y requiere confirmación inmediata de tu aplicación autenticadora.</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col items-center py-4 space-y-4">
          <label className="text-xs font-semibold text-foreground">
            <span>Introduce tu código TOTP de 6 dígitos:</span>
          </label>

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

          <DialogFooter className="w-full sm:justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              <span>Cancelar</span>
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={code.length !== 6 || isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Validando...</span>
                </>
              ) : (
                <span>Autorizar Acción</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

