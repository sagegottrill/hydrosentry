import { AlertTriangle, Send, Wrench, Bell, Droplets, Battery, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Alert } from '@/types/hydrosentry';
import { LIFePO4_CELL_NOMINAL_V } from '@/types/hydrosentry';

interface ActionDispatcherProps {
  alerts: Alert[];
  onDispatch: (alertId: string, actionType: string) => void;
  className?: string;
}

export function ActionDispatcher({ alerts, onDispatch, className }: ActionDispatcherProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const priorityConfig = {
    critical: {
      bg: 'bg-rose-50 border-rose-200',
      badge: 'bg-rose-100 text-rose-700 border border-rose-200',
      icon: AlertTriangle
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      badge: 'bg-amber-100 text-amber-700 border border-amber-200',
      icon: Bell
    },
    info: {
      bg: 'bg-primary/5 border-primary/15',
      badge: 'border border-primary/20 bg-primary/10 text-primary',
      icon: Bell
    }
  };

  // Sort alerts by priority
  const sortedAlerts = [...alerts].sort((a, b) => {
    const priorityOrder = { critical: 0, warning: 1, info: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div
      className={cn(
        'dashboard-card flex h-full min-h-0 max-h-full flex-col overflow-hidden',
        className,
      )}
    >
      <div className="shrink-0 border-b border-border/40 bg-muted/15 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/8">
              <Send className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
            </div>
            Dispatch
          </h2>
          <span className="rounded border border-primary/15 bg-primary/5 px-2 py-0.5 text-2xs font-medium text-primary">
            Live
          </span>
        </div>
        <p className="mt-1 text-2xs text-muted-foreground">Prioritized field actions</p>
      </div>

      <div className="panel-scroll min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain bg-card p-3 sm:p-4">
        {sortedAlerts.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-muted/40">
              <Bell className="h-5 w-5 text-muted-foreground/50" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-foreground">No active alerts</p>
            <p className="mt-1 text-2xs text-muted-foreground">Threshold crossings appear here</p>
          </div>
        ) : (
          sortedAlerts.map((alert) => {
            const config = priorityConfig[alert.priority];
            const PriorityIcon = config.icon;

            const tel = alert.telemetry;
            const hydroCrit = Boolean(tel && alert.id.includes('water'));
            const battCrit = tel && tel.node_status === 'low_battery';

            return (
              <div
                key={alert.id}
                className={cn(
                  'group dashboard-card p-4 transition-colors duration-200 hover:border-muted-foreground/15',
                  hydroCrit && 'border-destructive/35 bg-destructive/[0.03]',
                  battCrit && !hydroCrit && 'border-amber-200/80 bg-amber-50/40',
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-2xs font-semibold uppercase tracking-wide',
                        config.badge,
                      )}
                    >
                      <PriorityIcon className="h-3 w-3" />
                      {alert.priority}
                    </span>
                    {alert.alertSource === 'telemetry' && (
                      <span className="flex items-center gap-1 rounded border border-primary/20 bg-primary/5 px-2 py-0.5 text-[0.625rem] font-medium uppercase tracking-wide text-primary">
                        <Radio className="h-3 w-3" />
                        ESP32 uplink
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">Just now</span>
                </div>

                {/* Title */}
                <h4 className="mb-1.5 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                  {alert.title}
                </h4>

                {/* Description */}
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  {alert.description}
                </p>

                {tel && (
                  <div
                    className={cn(
                      'mb-4 grid grid-cols-2 gap-2 rounded-lg border p-3 text-[11px]',
                      hydroCrit && 'border-rose-200 bg-rose-50/80',
                      battCrit && !hydroCrit && 'border-amber-200 bg-amber-50/80',
                      !hydroCrit && !battCrit && 'border-slate-200 bg-slate-50',
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Droplets
                        className={cn(
                          'h-4 w-4 shrink-0 mt-0.5',
                          hydroCrit ? 'text-rose-600' : 'text-[#005587]',
                        )}
                      />
                      <div>
                        <p className="font-bold uppercase tracking-wider text-slate-500">JSN-SR04T</p>
                        <p className="font-extrabold tabular-nums text-slate-900">
                          {tel.water_level_cm} cm
                          {alert.sensorNodeId && (
                            <span className="ml-1 font-mono text-[10px] text-slate-500">{alert.sensorNodeId}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Battery
                        className={cn(
                          'h-4 w-4 shrink-0 mt-0.5',
                          tel.node_status === 'low_battery' ? 'text-amber-600' : 'text-emerald-600',
                        )}
                      />
                      <div>
                        <p className="font-bold uppercase tracking-wider text-slate-500">LiFePO₄ cell</p>
                        <p className="font-extrabold tabular-nums text-slate-900">
                          {tel.battery_voltage.toFixed(2)} V
                          <span className="text-slate-500 font-semibold text-[10px] ml-1">
                            / {LIFePO4_CELL_NOMINAL_V} V
                          </span>
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-600 mt-0.5">
                          {tel.node_status.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                <div className="flex items-start gap-2 text-xs text-slate-700 mb-5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-white border border-slate-200 shadow-sm flex-shrink-0 mt-0.5">
                    <Wrench className="h-3 w-3 text-slate-500" />
                  </div>
                  <span className="font-medium leading-relaxed">Action: {alert.recommendation}</span>
                </div>

                {/* Action Button */}
                <Button
                  size="sm"
                  className={cn(
                    'h-10 w-full rounded-lg text-xs font-semibold shadow-sm',
                    alert.priority === 'critical'
                      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90',
                  )}
                  onClick={() => onDispatch(alert.id, alert.actionLabel)}
                >
                  {alert.actionLabel}
                  {alert.estimatedCost && (
                    <span className="ml-1.5 opacity-80 font-medium tracking-wide">
                      (Est. {formatCurrency(alert.estimatedCost)})
                    </span>
                  )}
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
