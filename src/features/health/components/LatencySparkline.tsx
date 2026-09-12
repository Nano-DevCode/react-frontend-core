import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';

interface LatencySparklineProps {
  data: Array<{ time: string; latency: number }>;
  color?: string;
}

export const LatencySparkline = ({
  data,
  color = '#8b5cf6',
}: LatencySparklineProps) => {
  const gradientId = `sparkline-grad-${color.replace('#', '')}`;

  return (
    <div className="notranslate h-14 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
          <Area
            type="monotone"
            dataKey="latency"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

