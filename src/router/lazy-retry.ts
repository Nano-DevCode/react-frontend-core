import { lazy, type ComponentType } from 'react';

/**
 * Envoltorio defensivo para React.lazy que tolera reconexiones de red,
 * reinicios del servidor Vite y desincronizaciones de módulos en caliente (HMR).
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error: unknown) {
      const isDynamicImportError =
        error instanceof Error &&
        (error.message.includes('dynamically imported module') ||
          error.message.includes('Failed to fetch') ||
          error.name === 'ChunkLoadError');

      if (isDynamicImportError && typeof window !== 'undefined') {
        const reloadKey = 'chunk_reload_attempted';
        const hasReloaded = window.sessionStorage.getItem(reloadKey);

        if (!hasReloaded) {
          window.sessionStorage.setItem(reloadKey, 'true');
          window.location.reload();
          return new Promise<{ default: T }>(() => {});
        }
      }
      throw error;
    }
  });
}

