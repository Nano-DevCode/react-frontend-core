import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/use-auth-store';
import { refreshAuthSession } from '@/api/auth-session';
import { getTokenRemainingTime, isTokenExpired } from '@/utils/jwt';

/**
 * Hook global para la gestión proactiva y longeva del ciclo de vida de la sesión.
 *
 * Características:
 * 1. Renovación anticipada amplia: Renueva el accessToken al 70% de su vida útil o 3 minutos
 *    antes de expirar (lo que ocurra primero), evitando cortes por throttling del navegador.
 * 2. Heartbeat periódico (cada 60s) + Keep-Alive por actividad del usuario: Mantiene la sesión
 *    viva mientras el refresh_token (hasta 30 días con "Recordar este equipo") sea válido.
 * 3. Tolerancia a fallos de red: Nunca cierra la sesión en el cliente por errores de red o 429;
 *    solo se cierra si el backend rechaza definitivamente /auth/refresh con 401/403.
 * 4. Recuperación tras suspensión/hibernación y sincronización multitestaña.
 */
export const useSessionManager = () => {
  const { accessToken, isAuthenticated, setAuth, logout } = useAuthStore();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRefreshingRef = useRef(false);
  const lastActivityRefreshRef = useRef<number>(0);

  // Limpiar temporizadores activos
  const clearTimers = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Función para disparar la renovación silenciosa
  const triggerSilentRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    try {
      await refreshAuthSession();
    } catch {
      // Si el refresco falla, auth-session ya evalúa si es 401/403 definitivo
      // o si es un fallo de red transitorio para mantener la sesión viva
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // Programar renovación anticipada + heartbeat continuo cada 60 segundos
  useEffect(() => {
    clearTimers();

    if (!isAuthenticated) {
      return;
    }

    if (!accessToken) {
      triggerSilentRefresh();
      return;
    }

    const remainingMs = getTokenRemainingTime(accessToken);

    // Si el token ya expiró o le quedan menos de 30 segundos, renovar de inmediato
    if (remainingMs <= 30_000) {
      triggerSilentRefresh();
      return;
    }

    // 1. Renovación Proactiva Temprana:
    // Renueva cuando falten 3 minutos (180s) o al 70% del tiempo restante (para tokens cortos),
    // garantizando un margen amplio antes de que caduque el accessToken.
    const THREE_MINUTES_MS = 3 * 60 * 1000;
    const earlyRefreshDelay = Math.max(
      10_000,
      Math.min(remainingMs - THREE_MINUTES_MS, Math.floor(remainingMs * 0.7))
    );

    refreshTimerRef.current = setTimeout(() => {
      triggerSilentRefresh();
    }, earlyRefreshDelay);

    // 2. Heartbeat de Respaldo cada 60s:
    // Si el navegador pausó el setTimeout en segundo plano (background tab throttling),
    // este intervalo verifica el estado real del token en el store y lo renueva si quedan < 3 min.
    heartbeatIntervalRef.current = setInterval(() => {
      const currentToken = useAuthStore.getState().accessToken;
      const currentlyAuth = useAuthStore.getState().isAuthenticated;
      if (!currentlyAuth) return;

      if (!currentToken || isTokenExpired(currentToken, 180)) {
        triggerSilentRefresh();
      }
    }, 60_000);

    return () => {
      clearTimers();
    };
  }, [accessToken, isAuthenticated, clearTimers, triggerSilentRefresh]);

  // Keep-Alive basado en actividad del usuario y retorno de pestaña activa
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkAndRefreshIfNeeded = (bufferSeconds: number) => {
      const currentToken = useAuthStore.getState().accessToken;
      if (!currentToken || isTokenExpired(currentToken, bufferSeconds)) {
        triggerSilentRefresh();
      }
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        // Al volver a la pestaña, renovar si al token le quedan menos de 3 minutos
        checkAndRefreshIfNeeded(180);
      }
    };

    const handleUserActivity = () => {
      const now = Date.now();
      // Evaluar máximo una vez cada 60 segundos durante interacción activa
      if (now - lastActivityRefreshRef.current < 60_000) return;
      lastActivityRefreshRef.current = now;

      // Si el usuario está interactuando y al token le quedan menos de 5 minutos (300s), renovar proactivamente
      checkAndRefreshIfNeeded(300);
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('online', handleVisibilityOrFocus);
    window.addEventListener('mousedown', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('online', handleVisibilityOrFocus);
      window.removeEventListener('mousedown', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [isAuthenticated, triggerSilentRefresh]);

  // Sincronización multitestaña de sesión (cierre de sesión y actualización de usuario)
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key !== 'sistema-saas-auth') return;

      if (!e.newValue) {
        clearTimers();
        logout();
        return;
      }

      try {
        const parsed = JSON.parse(e.newValue);
        const newState = parsed?.state;

        if (!newState?.isAuthenticated) {
          clearTimers();
          logout();
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
          return;
        }

        const currentToken = useAuthStore.getState().accessToken;
        if (newState.user && !currentToken) {
          triggerSilentRefresh();
        } else if (newState.user && currentToken) {
          setAuth(newState.user, currentToken);
        }
      } catch {
        // Ignorar JSON malformado de storage externo
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [clearTimers, logout, setAuth, triggerSilentRefresh]);
};

