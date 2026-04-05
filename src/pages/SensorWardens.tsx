import {
    Users, GraduationCap, Shield, DollarSign,
    CheckCircle, Clock, AlertCircle, Wrench, MapPin, Calendar
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { useSensorWardens, type SensorWarden } from '@/hooks/useSensorWardens';
import { cn } from '@/lib/utils';

const trainingConfig = {
    completed: { label: 'Completed', icon: CheckCircle, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    in_progress: { label: 'In Progress', icon: Clock, className: 'bg-amber-50 text-amber-700 border-amber-200' },
    pending: { label: 'Pending', icon: AlertCircle, className: 'bg-slate-50 text-slate-500 border-slate-200' },
};

const stipendConfig = {
    paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    overdue: { label: 'Overdue', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

function WardenCard({ warden }: { warden: SensorWarden }) {
    const training = trainingConfig[warden.trainingStatus];
    const stipend = stipendConfig[warden.stipendStatus];
    const TrainingIcon = training.icon;
    const completedModules = warden.trainingModules.filter(m => m.completed).length;
    const totalModules = warden.trainingModules.length;

    return (
        <div className="dashboard-card transition-shadow duration-200 hover:shadow-sm">
            <div className="space-y-5 p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-4">
                        <div className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                            warden.gender === 'female'
                                ? 'bg-pink-50 text-pink-600 border-pink-100'
                                : 'border-primary/20 bg-primary/8 text-primary',
                        )}>
                            {warden.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold tracking-tight text-foreground">{warden.name}</h3>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 shrink-0" /> {warden.location}
                            </p>
                        </div>
                    </div>
                    <span className={cn('flex shrink-0 items-center rounded-md border px-2 py-0.5 text-xs font-medium', training.className)}>
                        <TrainingIcon className="mr-1 h-3.5 w-3.5" />
                        {training.label}
                    </span>
                </div>

                {/* Training Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                        <span className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 shrink-0" /> Training modules
                        </span>
                        <span className="tabular-nums text-foreground">{completedModules}/{totalModules}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                'h-full',
                                warden.trainingStatus === 'completed' && 'bg-emerald-500',
                                warden.trainingStatus === 'in_progress' && 'bg-amber-500',
                                warden.trainingStatus === 'pending' && 'bg-slate-300',
                            )}
                            style={{ width: `${(completedModules / totalModules) * 100}%` }}
                        />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {warden.trainingModules.map((mod, i) => (
                            <span
                                key={i}
                                className={cn(
                                    'flex items-center rounded-md border px-2 py-1 text-xs font-medium',
                                    mod.completed
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-slate-50 text-slate-400 border-slate-200',
                                )}
                            >
                                {mod.completed ? <CheckCircle className="h-3 w-3 mr-1" /> : <div className="h-3 w-3 mr-1 rounded-full border border-slate-300" />}
                                {mod.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                        <p className="text-xl font-bold tabular-nums text-primary">{warden.assignedNodes.length}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Nodes</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                        <p className="text-xl font-bold tabular-nums text-amber-600">{warden.incidentsReported}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Incidents</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                        <p className="text-xl font-bold tabular-nums text-emerald-600">{warden.maintenanceCompleted}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Maintenance</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-3 border-t border-border pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
                    <span className={cn('w-fit rounded-md border px-2 py-1 font-medium', stipend.className)}>
                        ₦{warden.monthlyStipend.toLocaleString()}/mo — {stipend.label}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        Last check: {warden.lastCheckIn}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function SensorWardens() {
    const { wardens, stats } = useSensorWardens();

    return (
        <DashboardLayout>
            <div className="dashboard-shell">
                <PageHeader variant="compact" icon={Users} title="Sensor wardens" />

                <div className="stat-grid stat-grid-5">
                    {[
                        { label: 'Active wardens', value: stats.totalWardens, icon: Users, textCol: 'text-foreground', iconCol: 'text-primary' },
                        { label: 'Training done', value: stats.trainingCompleted, icon: GraduationCap, textCol: 'text-emerald-700', iconCol: 'text-emerald-500' },
                        { label: 'In training', value: stats.trainingInProgress, icon: Clock, textCol: 'text-amber-600', iconCol: 'text-amber-500' },
                        { label: 'Nodes covered', value: `${stats.nodesCovered}/${stats.totalNodes}`, icon: Shield, textCol: 'text-foreground', iconCol: 'text-muted-foreground' },
                        { label: 'Monthly budget', value: `₦${(stats.monthlyBudget / 1000).toFixed(0)}K`, icon: DollarSign, textCol: 'text-emerald-700', iconCol: 'text-emerald-500' },
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

                <div className="surface-card border-primary/15 p-5 sm:p-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                            <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
                                <DollarSign className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-lg font-semibold tracking-tight text-foreground">₦{stats.totalDisbursed.toLocaleString()} total disbursed</p>
                                <p className="mt-0.5 text-xs text-primary">Youth employment payments</p>
                            </div>
                        </div>
                        <div className="flex min-w-0 items-center gap-4 sm:border-l sm:border-border/60 sm:pl-6">
                            <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
                                <Wrench className="h-6 w-6 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-lg font-semibold tracking-tight text-foreground">{stats.totalMaintenance} maintenance tasks</p>
                                <p className="mt-0.5 text-xs text-primary">Completed by wardens</p>
                            </div>
                        </div>
                        <div className="flex min-w-0 items-center gap-4 sm:border-l sm:border-border/60 sm:pl-6">
                            <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
                                <Shield className="h-6 w-6 text-amber-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-lg font-semibold tracking-tight text-foreground">{stats.totalIncidents} incidents reported</p>
                                <p className="mt-0.5 text-xs text-primary">Community monitoring</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warden Cards Grid */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {wardens.map(warden => (
                        <WardenCard key={warden.id} warden={warden} />
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
