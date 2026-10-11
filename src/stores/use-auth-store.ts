import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserAuthContext } from '@/features/auth/types/auth.types';

interface AuthState {
  user: UserAuthContext | null;
  isAuthenticated: boolean;
  accessToken: string | null;

  setAuth: (user: UserAuthContext, token?: string) => void;
  updateUser: (partial: Partial<UserAuthContext>) => void;
  logout: () => void;
}

// ============================================================================
// Purga residual defensiva contra almacenamiento inseguro de tokens
// Remueve cualquier clave accessToken persistida previamente en localStorage
// ============================================================================
if (typeof window !== 'undefined') {
  try {
    const storageKey = 'sistema-saas-auth';
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
      if (parsed?.state && 'accessToken' in parsed.state) {
        delete parsed.state.accessToken;
        localStorage.setItem(storageKey, JSON.stringify(parsed));
      }
    }
  } catch {
    // Modo defensivo ante restricciones de privacidad en el navegador
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,

      setAuth: (user, token) =>
        set((state) => ({
          user: {
            ...state.user,
            ...user,
            isTwoFactorEnabled:
              user.isTwoFactorEnabled !== undefined
                ? user.isTwoFactorEnabled
                : state.user?.isTwoFactorEnabled,
          },
          isAuthenticated: true,
          // El accessToken reside EXCLUSIVAMENTE en memoria viva de JavaScript (Zustand state)
          accessToken: token ?? null,
        })),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
        }),
    }),
    {
      name: 'sistema-saas-auth',
      storage: createJSONStorage(() => localStorage),
      // HARDENING: Únicamente persistir datos no confidenciales de sesión del usuario.
      // El accessToken NUNCA se serializa en localStorage para mitigar robo por XSS.
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
