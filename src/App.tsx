import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './router';
import { AppPreloader } from './components/shared/AppPreloader';
import { useAuthStore } from './stores/use-auth-store';
import { useUIStore } from './stores/use-ui-store';
import { refreshAuthSession } from './api/auth-session';
import { useSessionManager } from './hooks/use-session-manager';
import { isTokenExpired } from './utils/jwt';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const theme = useUIStore((state) => state.theme);

  // Activa el monitoreo proactivo del ciclo de vida y renovación de la sesión
  useSessionManager();

  // Inicializar tema visual en el DOM
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(isDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Verificación y renovación de sesión inicial mediante cookies HttpOnly
  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      const { accessToken, isAuthenticated, logout } = useAuthStore.getState();

      // Si el usuario ya tiene un token autenticado válido, permitimos el acceso inmediato
      if (isAuthenticated && !isTokenExpired(accessToken, 60)) {
        if (isMounted) setIsInitializing(false);
        return;
      }

      try {
        await refreshAuthSession();
      } catch {
        // Si no hay cookies de refresco o falla, y el token actual está expirado o ausente
        if (isMounted && (!isAuthenticated || isTokenExpired(accessToken, 0))) {
          logout();
        }
      } finally {
        setTimeout(() => {
          if (isMounted) setIsInitializing(false);
        }, 400);
      }
    };

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isInitializing) {
    return <AppPreloader />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          className: 'notranslate font-sans text-xs',
        }}
      />
    </>
  );
}
