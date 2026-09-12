import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserAuthContext } from '@/types';

interface AuthState {
  user: UserAuthContext | null;
  isAuthenticated: boolean;
  accessToken: string | null;

  setAuth: (user: UserAuthContext, token?: string) => void;
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
          user: {
            ...state.user,
            ...user,
            isTwoFactorEnabled:
              user.isTwoFactorEnabled !== undefined
                ? user.isTwoFactorEnabled
                : state.user?.isTwoFactorEnabled,
          },
          isAuthenticated: true,
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
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
      }),
    }
  )
);

