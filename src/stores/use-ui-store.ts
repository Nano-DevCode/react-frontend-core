import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AppTheme = 'light' | 'dark' | 'system';

interface UIState {
  theme: AppTheme;
  isSidebarCollapsed: boolean;
  usersViewMode: 'table' | 'cards';
  setTheme: (theme: AppTheme) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setUsersViewMode: (mode: 'table' | 'cards') => void;
}

const applyThemeToDOM = (theme: AppTheme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(isDark ? 'dark' : 'light');
  } else {
    root.classList.add(theme);
  }
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      isSidebarCollapsed: false,
      usersViewMode: 'table',

      setTheme: (theme: AppTheme) => {
        applyThemeToDOM(theme);
        set({ theme });
      },
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed: boolean) =>
        set({ isSidebarCollapsed: collapsed }),
      setUsersViewMode: (usersViewMode) => set({ usersViewMode }),
    }),
    {
      name: 'sistema-saas-ui',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeToDOM(state.theme);
        }
      },
    }
  )
);

