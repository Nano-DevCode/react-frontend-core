import { Skeleton } from '@/components/ui/skeleton';

export const BentoGridSkeleton = () => {
  return (
    <div className="notranslate w-full space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/50 bg-card p-6 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-36 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

