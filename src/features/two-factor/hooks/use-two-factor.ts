import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getTwoFactorStatusAction,
  generateTwoFactorSecretAction,
  turnOnTwoFactorAction,
  turnOffTwoFactorAction,
  authenticateTwoFactorAction,
  executeCriticalAction,
} from '../actions/two-factor.actions';
import { useAuthStore } from '@/stores/use-auth-store';
import { syncUserSession } from '@/api/auth-session';
import type {
  TwoFactorCodeDto,
  Toggle2FADto,
  TwoFactorAuthDto,
} from '@/types/two-factor.types';

export const useTwoFactorStatusQuery = (enabled = true) => {
  const updateUser = useAuthStore((state) => state.updateUser);

  return useQuery({
    queryKey: ['two-factor', 'status'],
    queryFn: async () => {
      const data = await getTwoFactorStatusAction();
      updateUser({ isTwoFactorEnabled: data.isEnabled });
      return data;
    },
    initialData: () => {
      const isEnabled = Boolean(useAuthStore.getState().user?.isTwoFactorEnabled);
      return { isEnabled };
    },
    retry: false,
    enabled,
    staleTime: 1000 * 30, // 30s
  });
};

export const useTwoFactorGenerateQuery = (enabled = false) => {
  return useQuery({
    queryKey: ['two-factor', 'generate'],
    queryFn: generateTwoFactorSecretAction,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 min
  });
};

export const useTwoFactorTurnOnMutation = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (dto: TwoFactorCodeDto) => turnOnTwoFactorAction(dto),
    onSuccess: async (data) => {
      updateUser({ isTwoFactorEnabled: true });
      await syncUserSession();
      queryClient.invalidateQueries({ queryKey: ['two-factor'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success(data.message || '2FA activado exitosamente');
    },
  });
};

export const useTwoFactorTurnOffMutation = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (dto: Toggle2FADto) => turnOffTwoFactorAction(dto),
    onSuccess: async (data) => {
      updateUser({ isTwoFactorEnabled: false });
      await syncUserSession();
      queryClient.invalidateQueries({ queryKey: ['two-factor'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success(data.message || '2FA desactivado exitosamente');
    },
  });
};

export const useTwoFactorAuthenticateMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (dto: TwoFactorAuthDto) => authenticateTwoFactorAction(dto),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      toast.success('¡Verificación 2FA exitosa! Bienvenido.');
    },
  });
};

export const useCriticalActionMutation = () => {
  return useMutation({
    mutationFn: (totpCode: string) => executeCriticalAction(totpCode),
    onSuccess: (data) => {
      toast.success(data.message || 'Acción crítica autorizada exitosamente');
    },
  });
};

