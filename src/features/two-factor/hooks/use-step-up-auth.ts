import { useState, useCallback } from 'react';
import { executeCriticalAction } from '../actions/two-factor.actions';
import { toast } from 'sonner';

export const useStepUpAuth = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [resolver, setResolver] = useState<{
    resolve: (code: string) => void;
    reject: (error: Error) => void;
  } | null>(null);

  const requestStepUp = useCallback((): Promise<string> => {
    setIsOpen(true);
    return new Promise((resolve, reject) => {
      setResolver({ resolve, reject });
    });
  }, []);

  const confirmCode = async (code: string) => {
    setIsPending(true);
    try {
      await executeCriticalAction(code);
      if (resolver) {
        resolver.resolve(code);
      }
      setIsOpen(false);
      toast.success('Autorización Step-Up confirmada');
    } catch (err) {
      if (resolver) {
        resolver.reject(err as Error);
      }
    } finally {
      setIsPending(false);
      setResolver(null);
    }
  };

  const cancelStepUp = () => {
    if (resolver) {
      resolver.reject(new Error('Autorización cancelada por el usuario'));
    }
    setIsOpen(false);
    setResolver(null);
  };

  return {
    isOpen,
    isPending,
    requestStepUp,
    confirmCode,
    cancelStepUp,
  };
};

