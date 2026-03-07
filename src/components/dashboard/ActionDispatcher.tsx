import { AlertTriangle, Send, Wrench, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Alert } from '@/types/hydrosentry';

interface ActionDispatcherProps {
  alerts: Alert[];
  onDispatch: (alertId: string, actionType: string) => void;
}

export function ActionDispatcher({ alerts, onDispatch }: ActionDispatcherProps) {
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
      bg: 'bg-sky-50 border-sky-200',
      badge: 'bg-sky-100 text-[#005587] border border-sky-200',
      icon: Bell
    }
  };

  // Sort alerts by priority
  const sortedAlerts = [...alerts].sort((a, b) => {
    const priorityOrder = { critical: 0, warning: 1, info: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-lifted">
      <div className="p-5 flex flex-col gap-1 bg-slate-50/80 backdrop-blur-md rounded-t-2xl">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-[#005587]/10 flex items-center justify-center">
              <Send className="h-4 w-4 text-[#005587]" />
            </div>
            Action Dispatcher
          </h2>
          <span className="text-[10px] uppercase font-bold text-[#005587] tracking-wider bg-[#005587]/5 px-2 py-1 rounded-md border border-[#005587]/10">
            Live Feed
          </span>
        </div>
        <p className="text-xs font-medium text-slate-500 mt-2">
          Priority Event Queue & Work Orders
        </p>
      </div>

      <div className="p-5 space-y-4 bg-slate-50/30 rounded-b-2xl">
        {sortedAlerts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 border border-slate-200/50">
              <Bell className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">No Active Events</p>
          </div>
        ) : (
          sortedAlerts.map((alert) => {
            const config = priorityConfig[alert.priority];
            const PriorityIcon = config.icon;

            return (
              <div
                key={alert.id}
                className={cn(
                  "p-5 rounded-xl bg-white shadow-soft hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                    config.badge
                  )}>
                    <PriorityIcon className="h-3 w-3" />
                    {alert.priority}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">Just now</span>
                </div>

                {/* Title */}
                <h4 className="font-bold text-sm text-slate-900 mb-1.5 leading-snug group-hover:text-[#005587] transition-colors">
                  {alert.title}
                </h4>

                {/* Description */}
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  {alert.description}
                </p>

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
                    "w-full text-xs font-bold h-10 shadow-sm transition-all focus:ring-2 focus:ring-offset-1 rounded-lg",
                    alert.priority === 'critical'
                      ? "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 hover:shadow-rose-600/20"
                      : "bg-[#005587] hover:bg-[#003d63] text-white focus:ring-[#005587] hover:shadow-[#005587]/20"
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
