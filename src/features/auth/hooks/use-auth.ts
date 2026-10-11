import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  loginAction,
  registerAction,
  verifyEmailAction,
  resendVerificationAction,
  logoutAction,
} from '../actions/auth.actions';
import { useAuthStore } from '@/stores/use-auth-store';
import type { LoginDto, RegisterDto, ResendVerificationDto } from '../types/auth.types';

export const useLoginMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (dto: LoginDto) => loginAction(dto),
    onSuccess: (data) => {
      if ('require2FA' in data && data.require2FA) {
        toast.info('Se requiere validación de segundo factor (2FA)');
        return;
      }
      if ('accessToken' in data && data.accessToken) {
        setAuth(data.user, data.accessToken);
        toast.success('¡Bienvenido! Sesión iniciada con éxito');
      }
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (dto: RegisterDto) => registerAction(dto),
    onSuccess: (data) => {
      toast.success(data.message || 'Registro completado. Por favor verifica tu correo.');
    },
  });
};

export const useVerifyEmailQuery = (token: string | null) => {
  return useQuery({
    queryKey: ['verify-email', token],
    queryFn: () => verifyEmailAction(token as string),
    enabled: Boolean(token),
    retry: false,
  });
};

export const useResendVerificationMutation = () => {
  return useMutation({
    mutationFn: (dto: ResendVerificationDto) => resendVerificationAction(dto),
    onSuccess: (data) => {
      toast.success(data.message);
    },
  });
};

export const useLogoutMutation = () => {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutAction,
    onSettled: () => {
      logout();
      queryClient.clear();
      navigate('/login');
      toast.success('Sesión finalizada correctamente');
    },
  });
};

