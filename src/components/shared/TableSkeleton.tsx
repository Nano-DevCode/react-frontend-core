import { Skeleton } from '@/components/ui/skeleton';

export const TableSkeleton = ({
  rows = 8,
  columns = 6,
}: {
  rows?: number;
  columns?: number;
}) => {
  return (
    <div className="notranslate w-full space-y-4 p-4 sm:p-6">
      {/* Barra superior de controles */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <Skeleton className="h-10 w-full sm:w-72 rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* Cabecera y filas pulsantes */}
      <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
        <div className="flex border-b border-border/40 bg-muted/40 p-3.5 gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-5 flex-1" />
          ))}
        </div>
        <div className="divide-y divide-border/30">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center p-3.5 gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  className={`h-6 flex-1 ${colIndex === 1 ? 'w-48' : 'w-full'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

