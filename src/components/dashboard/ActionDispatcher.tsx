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
      bg: 'bg-destructive/5 border-destructive/20',
      badge: 'bg-destructive text-destructive-foreground',
      icon: AlertTriangle
    },
    warning: {
      bg: 'bg-warning/5 border-warning/20',
      badge: 'bg-warning text-warning-foreground',
      icon: Bell
    },
    info: {
      bg: 'bg-primary/5 border-primary/20',
      badge: 'bg-primary text-primary-foreground',
      icon: Bell
    }
  };

  // Sort alerts by priority
  const sortedAlerts = [...alerts].sort((a, b) => {
    const priorityOrder = { critical: 0, warning: 1, info: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Send className="h-5 w-5 text-primary" />
          Action Dispatcher
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Priority alerts sorted by urgency
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto space-y-3">
        {sortedAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active alerts for this season</p>
          </div>
        ) : (
          sortedAlerts.map((alert) => {
            const config = priorityConfig[alert.priority];
            const PriorityIcon = config.icon;
            
            return (
              <div
                key={alert.id}
                className={cn(
                  "p-3 rounded-lg border transition-colors",
                  config.bg
                )}
              >
                {/* Header */}
                <div className="flex items-start gap-2 mb-2">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                    config.badge
                  )}>
                    {alert.priority}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-semibold text-sm text-foreground mb-1">
                  {alert.title}
                </h4>

                {/* Description */}
                <p className="text-xs text-muted-foreground mb-2">
                  {alert.description}
                </p>

                {/* Recommendation */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <Wrench className="h-3 w-3" />
                  <span>Recommendation: {alert.recommendation}</span>
                </div>

                {/* Action Button */}
                <Button
                  size="sm"
                  className={cn(
                    "w-full",
                    alert.priority === 'critical' 
                      ? "bg-primary hover:bg-primary/90" 
                      : "bg-muted text-foreground hover:bg-muted/80"
                  )}
                  onClick={() => onDispatch(alert.id, alert.actionLabel)}
                >
                  {alert.actionLabel}
                  {alert.estimatedCost && (
                    <span className="ml-1 opacity-75">
                      (Est. {formatCurrency(alert.estimatedCost)})
                    </span>
                  )}
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
