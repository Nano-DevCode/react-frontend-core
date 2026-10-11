import * as React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'notranslate flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-border/80 bg-muted/10',
        className
      )}
      {...props}
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-3.5 shadow-xs">
        <Icon className="size-6 opacity-80" />
      </div>

      <h3 className="text-sm font-semibold text-foreground tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
