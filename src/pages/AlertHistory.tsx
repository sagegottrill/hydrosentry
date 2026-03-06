import {
    Bell, MessageSquare, AlertTriangle, CheckCircle, Clock,
    Radio, Siren, Shield, Mail, ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAlertHistory, type AlertEvent } from '@/hooks/useAlertHistory';
import { cn } from '@/lib/utils';

const severityConfig = {
    critical: { label: 'Critical', className: 'bg-destructive text-destructive-foreground', icon: AlertTriangle },
    warning: { label: 'Warning', className: 'bg-warning text-warning-foreground', icon: AlertTriangle },
    info: { label: 'Info', className: 'bg-primary text-primary-foreground', icon: Bell },
};

const typeConfig: Record<string, { label: string; icon: any }> = {
    flood_warning: { label: 'Flood Warning', icon: AlertTriangle },
    anomaly: { label: 'TinyML Anomaly', icon: Radio },
    equipment_failure: { label: 'Equipment Failure', icon: Shield },
    low_battery: { label: 'Low Battery', icon: Bell },
    siren_activated: { label: 'Siren Activated', icon: Siren },
};

const statusConfig = {
    active: { label: 'Active', className: 'bg-destructive/10 text-destructive border-destructive/30' },
    acknowledged: { label: 'Acknowledged', className: 'bg-warning/10 text-warning border-warning/30' },
    resolved: { label: 'Resolved', className: 'bg-success/10 text-success border-success/30' },
};

function AlertCard({ alert }: { alert: AlertEvent }) {
    const severity = severityConfig[alert.severity];
    const type = typeConfig[alert.type] ?? { label: alert.type, icon: Bell };
    const status = statusConfig[alert.status];
    const TypeIcon = type.icon;
    const isLive = alert.id.startsWith('AH-LIVE');

    return (
        <div className={cn(
            'p-5 rounded-xl border transition-all',
            isLive
                ? 'bg-destructive/5 border-destructive/30 ring-2 ring-destructive/20 animate-pulse'
                : 'bg-card border-border hover:shadow-sm',
        )}>
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                    'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                    alert.severity === 'critical' ? 'bg-destructive/10' :
                        alert.severity === 'warning' ? 'bg-warning/10' : 'bg-primary/10',
                )}>
                    <TypeIcon className={cn(
                        'h-5 w-5',
                        alert.severity === 'critical' ? 'text-destructive' :
                            alert.severity === 'warning' ? 'text-warning' : 'text-primary',
                    )} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={cn('text-xs', severity.className)}>{severity.label}</Badge>
                        <Badge variant="outline" className={cn('text-xs', status.className)}>{status.label}</Badge>
                        <span className="text-xs text-muted-foreground">{type.label}</span>
                        {isLive && (
                            <Badge className="bg-destructive text-destructive-foreground text-xs animate-pulse">
                                🔴 LIVE
                            </Badge>
                        )}
                    </div>

                    <p className="text-sm text-foreground font-medium leading-relaxed">{alert.message}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Radio className="h-3 w-3" /> {alert.sensorName}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {alert.relativeTime}
                        </span>
                        {alert.sirenActivated && (
                            <span className="flex items-center gap-1 text-destructive font-medium">
                                <Siren className="h-3 w-3" /> Siren Activated
                            </span>
                        )}
                    </div>

                    {/* SMS Delivery */}
                    {alert.smsDelivery && (
                        <div className="mt-3 p-3 rounded-lg bg-secondary/50 border border-border">
                            <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-4 w-4 text-primary" />
                                <span className="text-xs font-semibold text-foreground">SMS Delivery Report</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center">
                                    <p className="text-lg font-bold text-foreground">{alert.smsDelivery.sent.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Sent</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-success">{alert.smsDelivery.delivered.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Delivered</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-destructive">{alert.smsDelivery.failed}</p>
                                    <p className="text-xs text-muted-foreground">Failed</p>
                                </div>
                            </div>
                            {alert.smsDelivery.sent > 0 && (
                                <div className="mt-2 w-full bg-secondary rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-success h-full rounded-full transition-all"
                                        style={{ width: `${(alert.smsDelivery.delivered / alert.smsDelivery.sent) * 100}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Resolution */}
                    {alert.resolvedAt && (
                        <div className="flex items-center gap-2 text-xs text-success">
                            <CheckCircle className="h-3 w-3" />
                            <span>Resolved by {alert.resolvedBy}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AlertHistory() {
    const { alerts, stats } = useAlertHistory();

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-secondary/30 p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Bell className="h-7 w-7 text-primary" />
                            Alert History & SMS Log
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Complete timeline of autonomous alerts, SMS delivery reports, and siren activations
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {[
                            { label: 'Total Alerts', value: stats.totalAlerts, icon: Bell, color: 'text-primary' },
                            { label: 'SMS Sent', value: stats.totalSmsSent.toLocaleString(), icon: MessageSquare, color: 'text-primary' },
                            { label: 'SMS Delivered', value: stats.totalSmsDelivered.toLocaleString(), icon: Mail, color: 'text-success' },
                            { label: 'Avg Response', value: `${stats.avgResponseMin} min`, icon: Clock, color: 'text-warning' },
                            { label: 'Sirens Fired', value: stats.sirensActivated, icon: Siren, color: 'text-destructive' },
                        ].map((s, i) => (
                            <Card key={i}>
                                <CardContent className="p-4 flex items-center gap-3">
                                    <s.icon className={cn('h-5 w-5 flex-shrink-0', s.color)} />
                                    <div>
                                        <p className="text-xl font-bold text-foreground">{s.value}</p>
                                        <p className="text-xs text-muted-foreground">{s.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Active alerts notice */}
                    {stats.activeAlerts > 0 && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                            <p className="text-sm text-foreground">
                                <strong>{stats.activeAlerts} active alert{stats.activeAlerts > 1 ? 's' : ''}</strong> requiring attention
                            </p>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="space-y-4">
                        {alerts.map(alert => (
                            <AlertCard key={alert.id} alert={alert} />
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
