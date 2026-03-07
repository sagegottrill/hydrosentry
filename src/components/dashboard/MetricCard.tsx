import { Card, CardContent } from '@/components/ui/card';
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
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  status = 'neutral',
  sparklineData,
  sparklineColor = 'hsl(var(--primary))'
}: MetricCardProps) {
  const statusConfig = {
    critical: {
      color: 'bg-rose-500',
      textColor: 'text-rose-600',
      icon: AlertTriangle,
      label: 'Critical'
    },
    warning: {
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      icon: AlertTriangle,
      label: 'Warning'
    },
    success: {
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      icon: CheckCircle,
      label: 'Verified'
    },
    neutral: {
      color: 'bg-slate-300',
      textColor: 'text-slate-600',
      icon: null,
      label: ''
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon || Activity;

  return (
    <div className="relative bg-white rounded-2xl shadow-soft hover:shadow-lifted transition-all duration-300 group flex flex-col h-full overflow-hidden">
      {/* Optional Top Accent Line */}
      {status !== 'neutral' && (
        <div className={`absolute top-0 left-0 right-0 h-1 transition-colors ${config.color}`} />
      )}

      <div className="p-6 flex flex-col h-full">
        {/* Header Row: Title & Top-Right Icon */}
        <div className="flex items-start justify-between mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {title}
          </p>
          <div className={cn(
            "w-9 h-9 flex items-center justify-center rounded-xl",
            status !== 'neutral' ? config.color.replace('bg-', 'bg-').replace('500', '100') : "bg-[#005587]/10"
          )}>
            <StatusIcon className={cn(
              "h-4 w-4",
              status !== 'neutral' ? config.textColor : "text-[#005587]"
            )} />
          </div>
        </div>

        {/* Content Row: Value & Sparkline */}
        <div className="flex items-end justify-between flex-1">
          <div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums font-display">
              {value}
            </p>

            {/* Badges and Subtitles Below Value */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {trend !== undefined && (
                <span className={cn(
                  "flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full",
                  trend > 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(trend)}%
                </span>
              )}

              {subtitle && (
                <span className="text-xs text-slate-500 font-medium">
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Sparkline anchored bottom-right */}
          {sparklineData && (
            <div className="w-24 h-12 ml-4 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient id={`gradient-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={sparklineColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={sparklineColor}
                    strokeWidth={2}
                    fill={`url(#gradient-${title.replace(/\s/g, '')})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
