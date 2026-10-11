import * as React from 'react';
import { Toaster as Sonner, toast, type ToasterProps } from 'sonner';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from 'lucide-react';
import { useUIStore } from '@/stores/use-ui-store';

export const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useUIStore((state) => state.theme);

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      closeButton
      duration={4000}
      icons={{
        success: (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" strokeWidth={2.25} />
          </span>
        ),
        error: (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <AlertCircle className="size-4" strokeWidth={2.25} />
          </span>
        ),
        warning: (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-4" strokeWidth={2.25} />
          </span>
        ),
        info: (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Info className="size-4" strokeWidth={2.25} />
          </span>
        ),
        loading: (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Loader2 className="size-4 animate-spin" strokeWidth={2.25} />
          </span>
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast notranslate font-sans text-sm rounded-xl p-4 shadow-lg border bg-card text-card-foreground border-border flex items-start gap-3 relative',
          title: 'font-semibold text-sm tracking-tight leading-snug text-foreground',
          description: 'text-xs mt-1 leading-relaxed text-muted-foreground font-normal',
          content: 'flex flex-col flex-1 min-w-0 pr-4',
          actionButton:
            'bg-primary text-primary-foreground font-medium text-xs px-3 py-1.5 rounded-lg shadow-sm hover:bg-primary/90 transition-colors cursor-pointer',
          cancelButton:
            'bg-muted text-muted-foreground font-medium text-xs px-3 py-1.5 rounded-lg hover:bg-muted/80 transition-colors cursor-pointer',
          closeButton:
            'hover:bg-muted text-muted-foreground hover:text-foreground rounded-md size-6 flex items-center justify-center border-0 bg-transparent transition-colors cursor-pointer',
          success: 'group-[.toaster]:border-emerald-500/30',
          error: 'group-[.toaster]:border-destructive/30',
          warning: 'group-[.toaster]:border-amber-500/30',
          info: 'group-[.toaster]:border-sky-500/30',
          loading: 'group-[.toaster]:border-primary/30',
        },
      }}
      {...props}
    />
  );
};

export { toast };
