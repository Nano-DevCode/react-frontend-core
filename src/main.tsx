import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './index.css';
import App from './App';

// ============================================================================
// Capa 4: Polyfill Defensivo a Nivel DOM contra Crashes de Google Translate
// ============================================================================
if (typeof window !== 'undefined') {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(
          'Google Translate intentó remover un nodo que no es hijo directo. Operación interceptada con éxito.'
        );
      }
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    referenceNode: Node | null
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(
          'Google Translate intentó insertar antes de un nodo ajeno. Operación interceptada con éxito.'
        );
      }
      return newNode;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;

        // No reintentar en errores definitivos del cliente
        if (status === 400 || status === 401 || status === 403 || status === 404 || status === 422) {
          return false;
        }

        // Ante 429 (Rate Limit), permitir máximo 2 reintentos suaves para no empeorar el throttling
        if (status === 429) {
          return failureCount < 2;
        }

        // Fallos de red o errores 5xx transitorios
        return failureCount < 2;
      },
      retryDelay: (attemptIndex, error) => {
        const response = (
          error as { response?: { status?: number; headers?: Record<string, string> } }
        )?.response;

        if (response?.status === 429) {
          const retryAfter =
            response.headers?.['retry-after'] ||
            response.headers?.['Retry-After'];

          if (retryAfter) {
            const parsed = parseInt(String(retryAfter), 10);
            if (!isNaN(parsed) && parsed > 0) {
              // Respetar tiempo exacto del backend + jitter suave para desincronizar ráfagas
              return parsed * 1000 + Math.floor(Math.random() * 500);
            }
          }

          // Retroceso exponencial suave para 429 con jitter (2s, 4s...)
          return Math.min(
            2000 * Math.pow(2, attemptIndex) + Math.floor(Math.random() * 500),
            15000
          );
        }

        return Math.min(1000 * Math.pow(2, attemptIndex), 10000);
      },
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutos de frescura de caché
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  </StrictMode>
);
