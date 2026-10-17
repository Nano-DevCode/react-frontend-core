import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/use-auth-store';
import { API_ENDPOINTS } from './endpoints';
import { isTokenExpired } from '@/utils/jwt';
import type { RefreshTokenResponse } from '@/features/auth/types/auth.types';

/**
 * Instancia aislada de Axios exclusivamente para operaciones de autenticación y refresco.
 * Garantiza que NUNCA se inyecte un Bearer token vencido en POST /auth/refresh.
 */
const authClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Promesa compartida para el patrón Single-Flight.
// Si múltiples peticiones solicitan un refresco concurrente, todas reutilizan esta misma promesa.
let refreshPromise: Promise<string> | null = null;
let lastRefreshTimestamp = 0;
let isTerminatingSession = false;

// Ventana de enfriamiento para evitar que StrictMode o eventos simultáneos (focus + visibilitychange)
// disparen rotaciones duplicadas del refresh_token en menos de 5 segundos.
const REFRESH_DEDUP_WINDOW_MS = 5_000;

/**
 * Cierra la sesión de forma controlada y elegante ante expiración definitiva del refresh token
 */
export const terminateSession = (
  reason = 'Tu sesión ha expirado por inactividad. Por favor, inicia sesión de nuevo.'
): void => {
  if (isTerminatingSession) return;
  isTerminatingSession = true;

  try {
    const { logout, isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      logout();
      toast.error(reason, {
        id: 'session-expired',
        duration: 5000,
      });
    }

    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      // Redirigir a login conservando la ruta de origen
      const currentPath = window.location.pathname + window.location.search;
      const redirectUrl = `/login?from=${encodeURIComponent(currentPath)}`;
      window.location.href = redirectUrl;
    }
  } finally {
    setTimeout(() => {
      isTerminatingSession = false;
    }, 2000);
  }
};

/**
 * Ejecuta la renovación transparente del token de acceso (Single-Flight + Cooldown).
 * Si ya hay un refresco en curso o se acaba de refrescar hace instantes, devuelve el token
 * vigente para evitar rotación criptográfica destructiva en el backend de NestJS.
 */
export const refreshAuthSession = async (force = false): Promise<string> => {
  // 1. Si ya existe una petición de refresco en vuelo, reutilizarla
  if (refreshPromise) {
    return refreshPromise;
  }

  // 2. Si hace menos de 5s ya se renovó el token exitosamente y sigue vigente, reutilizarlo
  const currentState = useAuthStore.getState();
  if (
    !force &&
    currentState.accessToken &&
    Date.now() - lastRefreshTimestamp < REFRESH_DEDUP_WINDOW_MS &&
    !isTokenExpired(currentState.accessToken, 120)
  ) {
    return currentState.accessToken;
  }

  const currentPromise = (async (): Promise<string> => {
    try {
      const response = await authClient.post<RefreshTokenResponse>(
        API_ENDPOINTS.AUTH.REFRESH,
        {}
      );

      const { accessToken, user } = response.data;
      if (!accessToken) {
        throw new Error('El backend no retornó un accessToken en /auth/refresh');
      }

      lastRefreshTimestamp = Date.now();

      // Actualización atómica en Zustand (conservando datos de usuario si el backend solo envía accessToken)
      useAuthStore.getState().setAuth(user ?? useAuthStore.getState().user, accessToken);

      return accessToken;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;

      // Únicamente si el backend confirma 401 o 403 Y el token de acceso actual ya está vencido,
      // terminamos la sesión. Errores de red o 429 NUNCA cierran la sesión del usuario.
      if (status === 401 || status === 403) {
        const currentToken = useAuthStore.getState().accessToken;
        if (isTokenExpired(currentToken, 0)) {
          terminateSession();
        }
      }

      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  refreshPromise = currentPromise;
  return currentPromise;
};

/**
 * Fuerza la sincronización reactiva de la sesión del usuario con el backend.
 * Se invoca tras modificar roles, activar/desactivar 2FA o cambiar estado,
 * asegurando que los claims en el frontend coincidan con la purga de caché en Redis del backend.
 */
export const syncUserSession = async (): Promise<void> => {
  try {
    await refreshAuthSession(true);
  } catch (err) {
    console.warn('Advertencia: No se pudo resincronizar la sesión con el backend:', err);
    throw err;
  }
};

