import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LatencySparkline } from './LatencySparkline';

export interface HealthFooterItem {
  label: string;
  value: string;
  icon?: LucideIcon;
}

export interface HealthStatusBadge {
  text: string;
  variant: 'success' | 'warning' | 'info' | 'error';
}

export interface HealthServiceCardProps {
  title: string;
  icon: LucideIcon;
  iconColorClass?: string;
  description: string;
  isUp: boolean;
  statusText?: { up: string; down: string };
  statusBadge?: HealthStatusBadge;
  latencyMetric: string;
  latencySubtitle: string;
  techBadge: string;
  sparklineData: Array<{ time: string; latency: number }>;
  sparklineColor: string;
  footerItems: HealthFooterItem[];
}

export const HealthServiceCard = ({
  title,
  icon: Icon,
  iconColorClass = 'text-primary',
  description,
  isUp,
  statusText = { up: 'OPERACIONAL', down: 'ERROR' },
  statusBadge,
  latencyMetric,
  latencySubtitle,
  techBadge,
  sparklineData,
  sparklineColor,
  footerItems,
}: HealthServiceCardProps) => {
  const badgeVariant = statusBadge?.variant ?? (isUp ? 'success' : 'error');
  const badgeText = statusBadge?.text ?? (isUp ? statusText.up : statusText.down);

  const dotColorClass =
    badgeVariant === 'success'
      ? 'bg-emerald-500 animate-pulse shadow-xs shadow-emerald-500/50'
      : badgeVariant === 'warning'
      ? 'bg-amber-500 animate-pulse shadow-xs shadow-amber-500/50'
      : badgeVariant === 'info'
      ? 'bg-sky-500 animate-pulse shadow-xs shadow-sky-500/50'
      : 'bg-red-500';

  const textColorClass =
    badgeVariant === 'success'
      ? 'text-emerald-600 dark:text-emerald-400 font-bold text-[11px]'
      : badgeVariant === 'warning'
      ? 'text-amber-600 dark:text-amber-400 font-bold text-[11px]'
      : badgeVariant === 'info'
      ? 'text-sky-600 dark:text-sky-400 font-bold text-[11px]'
      : 'text-destructive font-bold text-[11px]';

  return (
    <Card className="relative overflow-hidden border-border/80 hover-lift bg-card/90 shadow-2xs">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 font-semibold text-xs ${iconColorClass}`}>
            <Icon className="h-4 w-4" />
            <span>{title}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`h-2.5 w-2.5 rounded-full ${dotColorClass}`} />
            <span className={textColorClass}>
              <span>{badgeText}</span>
            </span>
          </div>
        </div>
        <CardDescription className="text-xs">
          <span>{description}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between pt-1">
          <div className="flex flex-col">
            <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
              <span>{latencyMetric}</span>
            </span>
            <span className="text-[10px] text-muted-foreground">
              <span>{latencySubtitle}</span>
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            <span>{techBadge}</span>
          </Badge>
        </div>

        <LatencySparkline data={sparklineData} color={sparklineColor} />

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
          {footerItems.map((item) => {
            const ItemIcon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-1">
                {ItemIcon && <ItemIcon className="h-3 w-3 text-emerald-500" />}
                <span>{item.label}:</span>{' '}
                <strong className="text-foreground font-semibold">{item.value}</strong>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
