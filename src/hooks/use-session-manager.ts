import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/use-auth-store';
import { refreshAuthSession, terminateSession } from '@/api/auth-session';
import { getTokenRemainingTime, isTokenExpired } from '@/utils/jwt';

/**
 * Hook global para la gestión proactiva del ciclo de vida de la sesión.
 *
 * Características:
 * 1. Renovación silenciosa anticipada: Refresca el token 60 segundos ANTES de que expire.
 * 2. Cierre proactivo por inactividad: Si el token expira definitivamente y no puede ser renovado,
 *    cierra la sesión de inmediato con aviso al usuario (no espera a que se haga un clic/solicitud).
 * 3. Recuperación tras suspensión/hibernación: Al reactivar la pestaña o pantalla ('visibilitychange' / 'focus'),
 *    verifica el estado del token y lo renueva si quedó caducado durante el reposo.
 * 4. Sincronización multitestaña: Sincroniza tokens renovados en otras pestañas vía evento 'storage'.
 */
export const useSessionManager = () => {
  const { accessToken, isAuthenticated, setAuth } = useAuthStore();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expirationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);

  // Limpiar temporizadores activos
  const clearTimers = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (expirationTimerRef.current) {
      clearTimeout(expirationTimerRef.current);
      expirationTimerRef.current = null;
    }
  }, []);

  // Función para disparar la renovación silenciosa
  const triggerSilentRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    try {
      await refreshAuthSession();
    } catch {
      // Si el refresco falla, auth-session ya evalúa si es 401/403 para cerrar sesión
      // o si es fallo de red transitorio para mantener la interfaz viva
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // Programar temporizadores basados en el token actual
  useEffect(() => {
    clearTimers();

    if (!isAuthenticated || !accessToken) {
      return;
    }

    const remainingMs = getTokenRemainingTime(accessToken);

    // Si el token ya expiró en el momento de evaluar
    if (remainingMs <= 0) {
      triggerSilentRefresh();
      return;
    }

    // 1. Temporizador de Renovación Proactiva (60 segundos antes de expirar)
    const REFRESH_BUFFER_MS = 60 * 1000; // 60 segundos de margen
    const refreshDelay = Math.max(1000, remainingMs - REFRESH_BUFFER_MS);

    refreshTimerRef.current = setTimeout(() => {
      triggerSilentRefresh();
    }, refreshDelay);

    // 2. Temporizador de Expiración Fatal Proactiva:
    // Si por algún motivo de red el refresco no tuvo éxito y llegamos al segundo exacto de expiración,
    // notificamos y cerramos la sesión proactivamente (sin esperar a que el usuario haga una solicitud).
    expirationTimerRef.current = setTimeout(() => {
      if (isTokenExpired(accessToken, 0)) {
        // Intentar un último rescate antes de cerrar
        refreshAuthSession().catch(() => {
          terminateSession('Tu sesión ha expirado por inactividad.');
        });
      }
    }, remainingMs + 1000); // 1 segundo posterior a exp

    return () => {
      clearTimers();
    };
  }, [accessToken, isAuthenticated, clearTimers, triggerSilentRefresh]);

  // Detector de retorno de reposo y cambio de pestaña activa
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible' && accessToken) {
        // Si al volver a la pestaña el token está próximo a expirar (dentro de 60s) o expiró
        if (isTokenExpired(accessToken, 60)) {
          triggerSilentRefresh();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [isAuthenticated, accessToken, triggerSilentRefresh]);

  // Sincronización multitestaña de sesión
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'sistema-saas-auth' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const newState = parsed?.state;
          if (newState && newState.accessToken && newState.accessToken !== accessToken) {
            setAuth(newState.user, newState.accessToken);
          }
        } catch {
          // Ignorar JSON malformado de storage externo
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [accessToken, setAuth]);
};

