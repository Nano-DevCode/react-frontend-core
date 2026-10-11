import * as React from 'react';
import { cn } from '@/lib/utils';

export type StatusBadgeVariant =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'pending'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'admin'
  | 'superadmin';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusBadgeVariant;
  label?: string;
  dot?: boolean;
}

export const StatusBadge = ({
  variant = 'neutral',
  label,
  dot = true,
  className,
  children,
  ...props
}: StatusBadgeProps) => {
  const variantStyles: Record<StatusBadgeVariant, { badge: string; dot: string }> = {
    active: {
      badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      dot: 'bg-emerald-500',
    },
    success: {
      badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      dot: 'bg-emerald-500',
    },
    inactive: {
      badge: 'bg-muted text-muted-foreground border-border',
      dot: 'bg-muted-foreground',
    },
    suspended: {
      badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
      dot: 'bg-amber-500',
    },
    pending: {
      badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
      dot: 'bg-amber-500 animate-pulse',
    },
    warning: {
      badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
      dot: 'bg-amber-500',
    },
    error: {
      badge: 'bg-destructive/10 text-destructive border-destructive/20',
      dot: 'bg-destructive',
    },
    neutral: {
      badge: 'bg-secondary text-secondary-foreground border-border',
      dot: 'bg-foreground/50',
    },
    admin: {
      badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
      dot: 'bg-purple-500',
    },
    superadmin: {
      badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
      dot: 'bg-rose-500',
    },
  };

  const style = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={cn(
        'notranslate inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium select-none',
        style.badge,
        className
      )}
      {...props}
    >
      {dot && <span className={cn('size-1.5 rounded-full shrink-0', style.dot)} />}
      <span>{label || children}</span>
    </span>
  );
};
