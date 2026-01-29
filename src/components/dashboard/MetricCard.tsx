import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
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
      badge: 'bg-destructive/10 text-destructive border-destructive/20',
      icon: AlertTriangle,
      label: 'Critical'
    },
    warning: {
      badge: 'bg-warning/10 text-warning border-warning/20',
      icon: AlertTriangle,
      label: 'Warning'
    },
    success: {
      badge: 'bg-success/10 text-success border-success/20',
      icon: CheckCircle,
      label: 'Verified'
    },
    neutral: {
      badge: 'bg-muted text-muted-foreground border-border',
      icon: null,
      label: ''
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {value}
            </p>
            
            <div className="flex items-center gap-2 flex-wrap">
              {trend !== undefined && (
                <span className={cn(
                  "flex items-center text-xs font-medium gap-0.5",
                  trend > 0 ? "text-destructive" : "text-success"
                )}>
                  {trend > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(trend)}%
                </span>
              )}
              
              {status !== 'neutral' && (
                <span className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border",
                  config.badge
                )}>
                  {StatusIcon && <StatusIcon className="h-3 w-3" />}
                  {config.label}
                </span>
              )}
              
              {subtitle && (
                <span className="text-xs text-muted-foreground">
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Sparkline */}
          {sparklineData && (
            <div className="w-20 h-12 ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient id={`gradient-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={sparklineColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={sparklineColor}
                    strokeWidth={1.5}
                    fill={`url(#gradient-${title.replace(/\s/g, '')})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
