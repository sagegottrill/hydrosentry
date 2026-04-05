import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  status?: 'critical' | 'warning' | 'success' | 'neutral';
  sparklineData?: { day: number; value: number }[];
  sparklineColor?: string;
  /** Opens linked view / drill-down when set */
  onClick?: () => void;
}

const statusStyles = {
  critical: {
    iconWrap: 'bg-destructive/8',
    iconClass: 'text-destructive',
    icon: AlertTriangle,
  },
  warning: {
    iconWrap: 'bg-amber-500/8',
    iconClass: 'text-amber-700 dark:text-amber-500',
    icon: AlertTriangle,
  },
  success: {
    iconWrap: 'bg-emerald-500/8',
    iconClass: 'text-emerald-700 dark:text-emerald-500',
    icon: CheckCircle,
  },
  neutral: {
    iconWrap: 'bg-muted/60',
    iconClass: 'text-muted-foreground',
    icon: Activity,
  },
} as const;

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  status = 'neutral',
  sparklineData,
  sparklineColor = 'hsl(var(--primary))',
  onClick,
}: MetricCardProps) {
  const st = statusStyles[status];
  const StatusIcon = st.icon;
  const gradId = `m-${title.replace(/\W/g, '').slice(0, 24) || 'spark'}-${status}`;

  return (
    <div
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `Open details: ${title}` : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'group dashboard-card flex h-full flex-col overflow-hidden transition-colors duration-200',
        'hover:border-muted-foreground/18',
        onClick && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
      )}
    >
      <div className="flex h-full flex-1 flex-col p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <p className="min-w-0 flex-1 text-xs font-medium leading-snug text-muted-foreground line-clamp-2">
            {title}
          </p>
          <div
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
              st.iconWrap,
            )}
          >
            <StatusIcon className={cn('h-3.5 w-3.5', st.iconClass)} strokeWidth={1.5} />
          </div>
        </div>

        <div className="mt-auto flex flex-1 items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="break-words text-xl font-bold leading-tight tracking-tight text-foreground tabular-nums sm:text-2xl">
              {value}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {trend !== undefined ? (
                <span
                  className={cn(
                    'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                    trend > 0 ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-700',
                  )}
                >
                  {trend > 0 ? (
                    <TrendingUp className="mr-0.5 h-3 w-3" strokeWidth={1.5} />
                  ) : (
                    <TrendingDown className="mr-0.5 h-3 w-3" strokeWidth={1.5} />
                  )}
                  {Math.abs(trend)}%
                </span>
              ) : null}
              {subtitle ? (
                <span className="text-xs font-normal leading-relaxed text-muted-foreground">{subtitle}</span>
              ) : null}
            </div>
          </div>

          {sparklineData ? (
            <div className="hidden h-11 w-20 shrink-0 opacity-75 transition-opacity duration-200 group-hover:opacity-100 min-[380px]:block sm:w-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={sparklineColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="natural"
                    dataKey="value"
                    stroke={sparklineColor}
                    strokeWidth={1.25}
                    fill={`url(#${gradId})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
