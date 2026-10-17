import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserAuthContext } from '@/features/auth/types/auth.types';

interface AuthState {
  user: UserAuthContext | null;
  isAuthenticated: boolean;
  accessToken: string | null;

  setAuth: (user: UserAuthContext | null | undefined, token?: string) => void;
  updateUser: (partial: Partial<UserAuthContext>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,

      setAuth: (user, token) =>
        set((state) => ({
          user: user
            ? {
                ...state.user,
                ...user,
                isTwoFactorEnabled:
                  user.isTwoFactorEnabled !== undefined
                    ? user.isTwoFactorEnabled
                    : state.user?.isTwoFactorEnabled,
              }
            : state.user,
          isAuthenticated: true,
          accessToken: token !== undefined ? token : state.accessToken,
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
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
      }),
    }
  )
);
