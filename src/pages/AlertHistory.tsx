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
    critical: { label: 'Critical', className: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertTriangle },
    warning: { label: 'Warning', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle },
    info: { label: 'Info', className: 'bg-sky-50 text-[#005587] border-sky-200', icon: Bell },
};

const typeConfig: Record<string, { label: string; icon: any }> = {
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
        <div className={cn(
            'p-6 rounded-xl transition-all',
            isLive
                ? 'bg-rose-50 ring-2 ring-rose-200 animate-[pulse_3s_ease-in-out_infinite]'
                : 'bg-white shadow-sm hover:shadow-soft',
        )}>
            <div className="flex items-start gap-5">
                {/* Icon */}
                <div className={cn(
                    'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border',
                    alert.severity === 'critical' ? 'bg-rose-50 border-rose-100' :
                        alert.severity === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-sky-50 border-sky-100',
                )}>
                    <TypeIcon className={cn(
                        'h-6 w-6',
                        alert.severity === 'critical' ? 'text-rose-600' :
                            alert.severity === 'warning' ? 'text-amber-600' : 'text-[#005587]',
                    )} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border', severity.className)}>{severity.label}</span>
                        <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border', status.className)}>{status.label}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{type.label}</span>
                        {isLive && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-rose-600 text-white animate-pulse">
                                🔴 LIVE
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-slate-900 font-semibold leading-relaxed">{alert.message}</p>

                    <div className="flex items-center gap-5 text-xs font-bold uppercase tracking-wider text-slate-500">
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
                        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="flex items-center gap-2 mb-3">
                                <MessageSquare className="h-4 w-4 text-[#005587]" />
                                <span className="text-[10px] uppercase font-bold text-slate-700 tracking-widest">SMS Delivery Report</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center bg-white py-2 rounded-lg border border-slate-100 shadow-sm">
                                    <p className="text-xl font-extrabold text-slate-900">{alert.smsDelivery.sent.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Sent</p>
                                </div>
                                <div className="text-center bg-white py-2 rounded-lg border border-emerald-100 shadow-sm">
                                    <p className="text-xl font-extrabold text-emerald-600">{alert.smsDelivery.delivered.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mt-0.5">Delivered</p>
                                </div>
                                <div className="text-center bg-white py-2 rounded-lg border border-rose-100 shadow-sm">
                                    <p className="text-xl font-extrabold text-rose-600">{alert.smsDelivery.failed}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-rose-700 mt-0.5">Failed</p>
                                </div>
                            </div>
                            {alert.smsDelivery.sent > 0 && (
                                <div className="mt-3 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
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
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 pt-2">
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

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto py-8 px-6 space-y-6">
                {/* Header */}
                <div className="border-b border-slate-200 pb-4">
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                        <Bell className="h-6 w-6 text-[#005587]" />
                        Alert History & SMS Log
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1.5">
                        Complete timeline of autonomous alerts, SMS delivery reports, and siren activations
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-px rounded-xl overflow-hidden bg-slate-100 shadow-soft">
                    {[
                        { label: 'Total Alerts', value: stats.totalAlerts, icon: Bell, textCol: 'text-slate-900', iconCol: 'text-[#005587]' },
                        { label: 'SMS Sent', value: stats.totalSmsSent.toLocaleString(), icon: MessageSquare, textCol: 'text-slate-900', iconCol: 'text-[#005587]' },
                        { label: 'SMS Delivered', value: stats.totalSmsDelivered.toLocaleString(), icon: Mail, textCol: 'text-emerald-600', iconCol: 'text-emerald-500' },
                        { label: 'Avg Response', value: `${stats.avgResponseMin}m`, icon: Clock, textCol: 'text-amber-600', iconCol: 'text-amber-500' },
                        { label: 'Sirens Fired', value: stats.sirensActivated, icon: Siren, textCol: 'text-rose-600', iconCol: 'text-rose-500' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-5 flex flex-col justify-center gap-1">
                            <div className="flex items-center gap-2 mb-1">
                                <s.icon className={cn('h-4 w-4 flex-shrink-0', s.iconCol)} />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                            </div>
                            <p className={cn("text-2xl font-extrabold tracking-tight", s.textCol)}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Active alerts notice */}
                {stats.activeAlerts > 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 shadow-sm">
                        <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />
                        <p className="text-sm text-slate-900 font-medium">
                            <strong className="font-bold">{stats.activeAlerts} active alert{stats.activeAlerts > 1 ? 's' : ''}</strong> requiring immediate attention
                        </p>
                    </div>
                )}

                {/* Timeline */}
                <div className="space-y-5">
                    {alerts.map(alert => (
                        <AlertCard key={alert.id} alert={alert} />
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
