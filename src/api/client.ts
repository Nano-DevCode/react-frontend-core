import axios, { type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/use-auth-store';
import { refreshAuthSession } from './auth-session';

// Extend AxiosRequestConfig to support suppressToast and _retry flags
declare module 'axios' {
  export interface AxiosRequestConfig {
    suppressToast?: boolean;
    _retry?: boolean;
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // Envía cookies HttpOnly en cada petición
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// Interceptor de Petición: Inyección de Idempotency-Key y Bearer fallback
// ============================================================================
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  const isAuthRoute =
    config.url?.includes('/auth/login') ||
    config.url?.includes('/auth/refresh') ||
    config.url?.includes('/auth/register');

  // Solo inyectar Authorization si NO es una ruta de autenticación/refresco
  if (token && !isAuthRoute && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Previene duplicidad en operaciones críticas o mutaciones
  const method = config.method?.toUpperCase();
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    if (!config.headers['Idempotency-Key']) {
      config.headers['Idempotency-Key'] =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
  }

  return config;
});

// ============================================================================
// Interceptor de Respuesta: Renovación transparente y toasts uniformes
// ============================================================================
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/register');

    // Renovación transparente en 401 usando el servicio Single-Flight
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAuthSession();

        // Inyectar de inmediato el nuevo token en los headers de la petición reintentada
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return apiClient(originalRequest);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    // Manejo global para Rate Limiting (HTTP 429 - Too Many Requests)
    if (error.response?.status === 429) {
      const retryAfterHeader =
        error.response.headers?.['retry-after'] ||
        error.response.headers?.['Retry-After'];

      let retryAfterSeconds: number | null = null;
      if (retryAfterHeader) {
        const parsed = parseInt(String(retryAfterHeader), 10);
        if (!isNaN(parsed) && parsed > 0) {
          retryAfterSeconds = parsed;
        }
      }

      const warningMessage = retryAfterSeconds
        ? `Demasiadas solicitudes. Por favor, espera ${retryAfterSeconds} segundos antes de continuar.`
        : 'Demasiadas solicitudes. Por favor, espera unos segundos antes de reintentar.';

      if (!originalRequest?.suppressToast) {
        toast.warning(warningMessage, {
          id: 'rate-limit-warning',
          duration: retryAfterSeconds
            ? Math.min(Math.max(retryAfterSeconds * 1000, 4000), 15000)
            : 5000,
        });
      }

      return Promise.reject(error);
    }

    // Captura uniforme del mensaje de error del backend
    const backendMessage = error.response?.data?.message;
    if (backendMessage && !originalRequest?.suppressToast) {
      const displayMsg = Array.isArray(backendMessage)
        ? backendMessage.join(', ')
        : backendMessage;
      toast.error(displayMsg);
    }

    return Promise.reject(error);
  }
);

