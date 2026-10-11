import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader = ({
  title,
  description,
  icon: Icon,
  badge,
  actions,
  className,
  children,
  ...props
}: PageHeaderProps) => {
  return (
    <div
      className={cn(
        'notranslate flex flex-col sm:flex-row sm:items-center justify-between gap-4',
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          {Icon && (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4.5" />
            </div>
          )}
          <h2 className="text-xl font-bold tracking-tight text-foreground m-0">
            {title}
          </h2>
          {badge}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {(actions || children) && (
        <div className="flex items-center gap-2 flex-wrap sm:self-center">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
};
