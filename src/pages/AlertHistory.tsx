import {
    Bell, MessageSquare, AlertTriangle, CheckCircle, Clock,
    Radio, Siren, Shield, Mail, type LucideIcon
} from 'lucide-react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { useAlertHistory, type AlertEvent } from '@/hooks/useAlertHistory';
import { cn } from '@/lib/utils';

const severityConfig = {
    critical: { label: 'Critical', className: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertTriangle },
    warning: { label: 'Warning', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle },
    info: { label: 'Info', className: 'bg-primary/5 text-primary border-primary/20', icon: Bell },
};

const typeConfig: Record<string, { label: string; icon: LucideIcon }> = {
    flood_warning: { label: 'Flood Warning', icon: AlertTriangle },
    anomaly: { label: 'TinyML Anomaly', icon: Radio },
    equipment_failure: { label: 'Equipment Failure', icon: Shield },
    low_battery: { label: 'Low Battery', icon: Bell },
    siren_activated: { label: 'Siren Activated', icon: Siren },
};

const statusConfig = {
    active: { label: 'Active', className: 'bg-rose-50 text-rose-700 border-rose-200' },
    acknowledged: { label: 'Acknowledged', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    resolved: { label: 'Resolved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

function AlertCard({ alert }: { alert: AlertEvent }) {
    const severity = severityConfig[alert.severity];
    const type = typeConfig[alert.type] ?? { label: alert.type, icon: Bell };
    const status = statusConfig[alert.status];
    const TypeIcon = type.icon;
    const isLive = alert.id.startsWith('AH-LIVE');

    return (
        <div
            id={`alert-${alert.id}`}
            className={cn(
                'dashboard-card scroll-mt-24 p-5 transition-shadow duration-200 sm:p-6',
                isLive
                    ? 'border-rose-200/90 bg-rose-50/80 shadow-sm'
                    : 'hover:shadow-sm',
            )}
        >
            <div className="flex items-start gap-4 sm:gap-5">
                {/* Icon */}
                <div className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border',
                        alert.severity === 'critical' ? 'bg-rose-50 border-rose-100' :
                        alert.severity === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-primary/5 border-primary/15',
                )}>
                    <TypeIcon className={cn(
                        'h-6 w-6',
                        alert.severity === 'critical' ? 'text-rose-600' :
                            alert.severity === 'warning' ? 'text-amber-600' : 'text-primary',
                    )} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={cn('rounded-md border px-2 py-0.5 text-xs font-medium', severity.className)}>{severity.label}</span>
                        <span className={cn('rounded-md border px-2 py-0.5 text-xs font-medium', status.className)}>{status.label}</span>
                        <span className="text-xs text-muted-foreground">{type.label}</span>
                        {isLive && (
                            <span className="rounded-md bg-rose-600 px-2 py-0.5 text-xs font-medium text-white">
                                Live
                            </span>
                        )}
                    </div>

                    <p className="text-sm font-medium leading-relaxed text-foreground">{alert.message}</p>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Radio className="h-4 w-4 text-slate-400" /> {alert.sensorName}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-slate-400" /> {alert.relativeTime}
                        </span>
                        {alert.sirenActivated && (
                            <span className="flex items-center gap-1.5 text-rose-600">
                                <Siren className="h-4 w-4" /> Siren Activated
                            </span>
                        )}
                    </div>

                    {/* SMS Delivery */}
                    {alert.smsDelivery && (
                        <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold text-foreground">SMS delivery</span>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-lg border border-border bg-card py-3 text-center">
                                    <p className="text-xl font-bold tabular-nums text-foreground">{alert.smsDelivery.sent.toLocaleString()}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Sent</p>
                                </div>
                                <div className="rounded-lg border border-emerald-200/80 bg-card py-3 text-center">
                                    <p className="text-xl font-bold tabular-nums text-emerald-600">{alert.smsDelivery.delivered.toLocaleString()}</p>
                                    <p className="mt-1 text-xs text-emerald-800/80">Delivered</p>
                                </div>
                                <div className="rounded-lg border border-rose-200/80 bg-card py-3 text-center">
                                    <p className="text-xl font-bold tabular-nums text-rose-600">{alert.smsDelivery.failed}</p>
                                    <p className="mt-1 text-xs text-rose-800/80">Failed</p>
                                </div>
                            </div>
                            {alert.smsDelivery.sent > 0 && (
                                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="bg-emerald-500 h-full rounded-full transition-all"
                                        style={{ width: `${(alert.smsDelivery.delivered / alert.smsDelivery.sent) * 100}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Resolution */}
                    {alert.resolvedAt && (
                        <div className="flex items-center gap-2 pt-2 text-xs font-medium text-emerald-700">
                            <CheckCircle className="h-4 w-4" />
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
    const location = useLocation();

    useEffect(() => {
        const raw = location.hash.replace(/^#/, '');
        if (!raw.startsWith('alert-')) return;
        const el = document.getElementById(raw);
        if (!el) return;
        requestAnimationFrame(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            el.classList.add('ring-2', 'ring-primary/35');
            window.setTimeout(() => el.classList.remove('ring-2', 'ring-primary/35'), 2400);
        });
    }, [location.hash, alerts]);

    return (
        <DashboardLayout>
            <div className="dashboard-shell">
                <PageHeader variant="compact" icon={Bell} title="Alert history" />

                <div className="stat-grid stat-grid-5">
                    {[
                        { label: 'Total alerts', value: stats.totalAlerts, icon: Bell, textCol: 'text-foreground', iconCol: 'text-primary' },
                        { label: 'SMS sent', value: stats.totalSmsSent.toLocaleString(), icon: MessageSquare, textCol: 'text-foreground', iconCol: 'text-primary' },
                        { label: 'SMS delivered', value: stats.totalSmsDelivered.toLocaleString(), icon: Mail, textCol: 'text-emerald-700', iconCol: 'text-emerald-500' },
                        { label: 'Avg response', value: `${stats.avgResponseMin}m`, icon: Clock, textCol: 'text-amber-700', iconCol: 'text-amber-500' },
                        { label: 'Sirens fired', value: stats.sirensActivated, icon: Siren, textCol: 'text-rose-600', iconCol: 'text-rose-500' },
                    ].map((s, i) => (
                        <div key={i} className="stat-tile">
                            <div className="stat-tile-head">
                                <s.icon className={cn('h-4 w-4 shrink-0', s.iconCol)} strokeWidth={1.75} />
                                <p className="stat-tile-label">{s.label}</p>
                            </div>
                            <p className={cn('stat-tile-value', s.textCol)}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Active alerts notice */}
                {stats.activeAlerts > 0 && (
                    <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50/90 p-4">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
                        <p className="text-sm font-medium text-foreground">
                            <span className="font-semibold">{stats.activeAlerts} active alert{stats.activeAlerts > 1 ? 's' : ''}</span>{' '}
                            requiring immediate attention
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
        </DashboardLayout>
    );
}
