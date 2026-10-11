import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export interface UseUrlPaginationOptions {
  /**
   * Nombre del parámetro en la query string para la página (por defecto: 'page').
   */
  pageKey?: string;
  /**
   * Nombre del parámetro en la query string para el límite por página (por defecto: 'limit').
   */
  limitKey?: string;
  /**
   * Página por defecto en caso de no especificarse en la URL (por defecto: 1).
   */
  defaultPage?: number;
  /**
   * Límite de elementos por defecto en caso de no especificarse en la URL (por defecto: 20).
   */
  defaultLimit?: number;
}

export interface UseUrlPaginationReturn {
  page: number;
  limit: number;
  setPage: (newPage: number) => void;
  setLimit: (newLimit: number) => void;
  resetPagination: () => void;
}

/**
 * Hook universal para sincronizar la paginación con los search params de la URL.
 * Permite que los enlaces con paginación sean 100% compartibles y persistentes
 * ante recargas de página o navegación en el historial.
 */
export function useUrlPagination(
  options: UseUrlPaginationOptions = {}
): UseUrlPaginationReturn {
  const {
    pageKey = 'page',
    limitKey = 'limit',
    defaultPage = 1,
    defaultLimit = 20,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  // Obtención y validación de la página activa desde la URL
  const page = useMemo(() => {
    const raw = searchParams.get(pageKey);
    if (!raw) return defaultPage;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) || parsed < 1 ? defaultPage : parsed;
  }, [searchParams, pageKey, defaultPage]);

  // Obtención y validación del límite activo desde la URL
  const limit = useMemo(() => {
    const raw = searchParams.get(limitKey);
    if (!raw) return defaultLimit;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) || parsed < 1 ? defaultLimit : parsed;
  }, [searchParams, limitKey, defaultLimit]);

  // Cambio de página preservando los demás parámetros de búsqueda existentes
  const setPage = useCallback(
    (newPage: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const targetPage = Math.max(1, newPage);

          if (targetPage === defaultPage) {
            next.delete(pageKey);
          } else {
            next.set(pageKey, String(targetPage));
          }

          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams, pageKey, defaultPage]
  );

  // Cambio de límite: actualiza el límite y reinicia la página a 1 para evitar estados inconsistentes
  const setLimit = useCallback(
    (newLimit: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const targetLimit = Math.max(1, newLimit);

          if (targetLimit === defaultLimit) {
            next.delete(limitKey);
          } else {
            next.set(limitKey, String(targetLimit));
          }

          // Reiniciar a la primera página al cambiar la densidad de filas
          next.delete(pageKey);

          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams, limitKey, defaultLimit, pageKey]
  );

  // Restablecer la paginación a los valores por defecto
  const resetPagination = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(pageKey);
        next.delete(limitKey);
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams, pageKey, limitKey]);

  return {
    page,
    limit,
    setPage,
    setLimit,
    resetPagination,
  };
}

