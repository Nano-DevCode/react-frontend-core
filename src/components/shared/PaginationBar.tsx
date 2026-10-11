import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUrlPagination, type UseUrlPaginationOptions } from '@/hooks/use-url-pagination';

export interface PaginationBarProps {
  /**
   * Total de páginas disponibles según el backend o la partición de datos.
   */
  totalPages: number;
  /**
   * Total global de registros/elementos.
   */
  totalRecords: number;
  /**
   * Página actual (opcional: si no se provee, se toma automáticamente de la URL).
   */
  page?: number;
  /**
   * Filas por página actuales (opcional: si no se provee, se toma automáticamente de la URL).
   */
  limit?: number;
  /**
   * Manejador invocado al cambiar de página (opcional: si no se provee, actualiza la URL automáticamente).
   */
  onPageChange?: (newPage: number) => void;
  /**
   * Manejador invocado al cambiar de límite (opcional: si no se provee, actualiza la URL automáticamente).
   */
  onLimitChange?: (newLimit: number) => void;
  /**
   * Nombre del parámetro para la página en la URL (por defecto: 'page').
   */
  pageKey?: string;
  /**
   * Nombre del parámetro para el límite en la URL (por defecto: 'limit').
   */
  limitKey?: string;
  /**
   * Opciones para el selector de filas por página. Por defecto: [10, 20, 50, 100].
   */
  pageSizeOptions?: number[];
  /**
   * Deshabilita los controles temporalmente durante mutaciones o cargas de TanStack Query.
   */
  isLoading?: boolean;
  /**
   * Permite ocultar el selector de cantidad de filas si no es requerido. Por defecto: true.
   */
  showPageSizeSelector?: boolean;
  /**
   * Clases CSS opcionales para personalizar el contenedor exterior.
   */
  className?: string;
}

/**
 * Genera la secuencia de páginas con elipsis inteligente (...)
 * respetando un número balanceado de botones visibles alrededor de la página actual.
 */
function generatePaginationRange(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];

  // Siempre incluir la primera página
  pages.push(1);

  if (currentPage > 3) {
    pages.push('ellipsis');
  }

  // Rango de páginas cercanas a la actual
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push('ellipsis');
  }

  // Siempre incluir la última página
  pages.push(totalPages);

  return pages;
}

/**
 * Componente universal de barra de paginación para tablas con TanStack Query y Shadcn/ui.
 * Totalmente sincronizado con la URL para enlaces compartibles y navegación persistente.
 */
export const PaginationBar: React.FC<PaginationBarProps> = ({
  totalPages,
  totalRecords,
  page: controlledPage,
  limit: controlledLimit,
  onPageChange: controlledOnPageChange,
  onLimitChange: controlledOnLimitChange,
  pageKey = 'page',
  limitKey = 'limit',
  pageSizeOptions = [10, 20, 50, 100],
  isLoading = false,
  showPageSizeSelector = true,
  className = '',
}) => {
  // Sincronización automática con la URL (fallback si no se pasan props controladas)
  const urlPaginationConfig: UseUrlPaginationOptions = {
    pageKey,
    limitKey,
    defaultPage: 1,
    defaultLimit: pageSizeOptions[1] ?? 20,
  };
  const urlPagination = useUrlPagination(urlPaginationConfig);

  const activePage = controlledPage ?? urlPagination.page;
  const activeLimit = controlledLimit ?? urlPagination.limit;
  const handlePageChange = controlledOnPageChange ?? urlPagination.setPage;
  const handleLimitChange = controlledOnLimitChange ?? urlPagination.setLimit;

  // Cálculo defensivo de rango de elementos visualizados
  const validTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, activePage), validTotalPages);
  const startItem = totalRecords === 0 ? 0 : (safePage - 1) * activeLimit + 1;
  const endItem = Math.min(safePage * activeLimit, totalRecords);

  const pagesRange = generatePaginationRange(safePage, validTotalPages);

  return (
    <div
      className={`notranslate flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-border/70 text-xs text-muted-foreground bg-card/60 backdrop-blur-xs select-none ${className}`}
    >
      {/* Sección Izquierda: Selector de Tamaño de Página y Rango */}
      <div className="flex items-center gap-3.5 flex-wrap justify-center sm:justify-start">
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Mostrar</span>
            <select
              value={activeLimit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              disabled={isLoading || totalRecords === 0}
              aria-label="Cantidad de filas por página"
              className="h-8 rounded-lg border border-border/80 bg-background px-2 py-0.5 text-xs text-foreground font-medium shadow-2xs hover:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} filas
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="text-muted-foreground whitespace-nowrap">
          <span>Mostrando </span>
          <strong className="text-foreground font-mono font-semibold">{startItem}</strong>
          <span> – </span>
          <strong className="text-foreground font-mono font-semibold">{endItem}</strong>
          <span> de </span>
          <strong className="text-foreground font-mono font-semibold">{totalRecords}</strong>
          <span> registros</span>
        </div>
      </div>

      {/* Sección Derecha: Botones de Paginación */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Botón: Primera Página */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={safePage <= 1 || isLoading}
          className="h-8 w-8 hidden md:inline-flex shadow-2xs"
          title="Primera página"
          aria-label="Ir a la primera página"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Botón: Página Anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(safePage - 1)}
          disabled={safePage <= 1 || isLoading}
          className="h-8 px-2.5 gap-1 shadow-2xs"
          aria-label="Ir a la página anterior"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {/* Vista Móvil: Indicador Compacto */}
        <div className="inline-flex md:hidden items-center px-2 py-1 text-xs font-mono font-medium text-foreground bg-muted/60 rounded-md border border-border/60">
          <span>{safePage} / {validTotalPages}</span>
        </div>

        {/* Vista Escritorio: Botones Numéricos con Elipsis */}
        <div className="hidden md:flex items-center gap-1">
          {pagesRange.map((item, idx) => {
            if (item === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-muted-foreground/60 flex items-center justify-center h-8 w-6"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </span>
              );
            }

            const isCurrent = item === safePage;

            return (
              <Button
                key={`page-btn-${item}`}
                variant={isCurrent ? 'default' : 'ghost'}
                size="icon"
                onClick={() => handlePageChange(item)}
                disabled={isLoading}
                className={`h-8 w-8 text-xs font-mono font-semibold transition-all ${
                  isCurrent
                    ? 'shadow-xs shadow-primary/20 pointer-events-none'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Página ${item}`}
              >
                {item}
              </Button>
            );
          })}
        </div>

        {/* Botón: Página Siguiente */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(safePage + 1)}
          disabled={safePage >= validTotalPages || isLoading}
          className="h-8 px-2.5 gap-1 shadow-2xs"
          aria-label="Ir a la página siguiente"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        {/* Botón: Última Página */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(validTotalPages)}
          disabled={safePage >= validTotalPages || isLoading}
          className="h-8 w-8 hidden md:inline-flex shadow-2xs"
          title="Última página"
          aria-label="Ir a la última página"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default PaginationBar;
