import {
    Users, GraduationCap, Shield, DollarSign,
    CheckCircle, Clock, AlertCircle, Wrench, Phone, MapPin, Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
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
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-sky-300 transition-all">
            <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border',
                            warden.gender === 'female'
                                ? 'bg-pink-50 text-pink-600 border-pink-100'
                                : 'bg-[#005587]/10 text-[#005587] border-[#005587]/20',
                        )}>
                            {warden.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-slate-900 tracking-tight">{warden.name}</h3>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                                <MapPin className="h-3 w-3" /> {warden.location}
                            </p>
                        </div>
                    </div>
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border flex items-center', training.className)}>
                        <TrainingIcon className="h-3 w-3 mr-1" />
                        {training.label}
                    </span>
                </div>

                {/* Training Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-500 flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5" /> Training Modules
                        </span>
                        <span className="text-slate-900">{completedModules}/{totalModules}</span>
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
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {warden.trainingModules.map((mod, i) => (
                            <span
                                key={i}
                                className={cn(
                                    'text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border flex items-center',
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
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                    <div className="text-center bg-slate-50 rounded-lg p-2 border border-slate-100">
                        <p className="text-xl font-extrabold text-[#005587]">{warden.assignedNodes.length}</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">Nodes</p>
                    </div>
                    <div className="text-center bg-slate-50 rounded-lg p-2 border border-slate-100">
                        <p className="text-xl font-extrabold text-amber-600">{warden.incidentsReported}</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">Incidents</p>
                    </div>
                    <div className="text-center bg-slate-50 rounded-lg p-2 border border-slate-100">
                        <p className="text-xl font-extrabold text-emerald-600">{warden.maintenanceCompleted}</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">Maint.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border', stipend.className)}>
                        ₦{warden.monthlyStipend.toLocaleString()}/mo — {stipend.label}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Last Check: {warden.lastCheckIn}
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
            <div className="max-w-7xl mx-auto py-8 px-6 space-y-6">
                {/* Header */}
                <div className="border-b border-slate-200 pb-4">
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                        <Users className="h-6 w-6 text-[#005587]" />
                        Sensor Wardens Program
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1.5">
                        Youth employment initiative — training, maintaining, and protecting the LoRaWAN sensor network
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-xl overflow-hidden bg-slate-100 shadow-soft">
                    {[
                        { label: 'Active Wardens', value: stats.totalWardens, icon: Users, textCol: 'text-slate-900', iconCol: 'text-[#005587]' },
                        { label: 'Training Done', value: stats.trainingCompleted, icon: GraduationCap, textCol: 'text-emerald-700', iconCol: 'text-emerald-500' },
                        { label: 'In Training', value: stats.trainingInProgress, icon: Clock, textCol: 'text-amber-600', iconCol: 'text-amber-500' },
                        { label: 'Nodes Covered', value: `${stats.nodesCovered}/${stats.totalNodes}`, icon: Shield, textCol: 'text-slate-900', iconCol: 'text-slate-400' },
                        { label: 'Monthly Budget', value: `₦${(stats.monthlyBudget / 1000).toFixed(0)}K`, icon: DollarSign, textCol: 'text-emerald-700', iconCol: 'text-emerald-500' },
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

                {/* Impact summary */}
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-lg border border-emerald-100 shadow-sm">
                                <DollarSign className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-900 tracking-tight">₦{stats.totalDisbursed.toLocaleString()} Total Disbursed</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#005587] mt-0.5">Direct youth employment payments</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 border-l-0 sm:border-l sm:pl-6 border-sky-200">
                            <div className="p-3 bg-white rounded-lg border border-sky-100 shadow-sm">
                                <Wrench className="h-6 w-6 text-[#005587]" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-900 tracking-tight">{stats.totalMaintenance} Maintenance Tasks</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#005587] mt-0.5">Completed by wardens</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 border-l-0 sm:border-l sm:pl-6 border-sky-200">
                            <div className="p-3 bg-white rounded-lg border border-amber-100 shadow-sm">
                                <Shield className="h-6 w-6 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-900 tracking-tight">{stats.totalIncidents} Incidents Reported</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#005587] mt-0.5">Proactive community monitoring</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warden Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {wardens.map(warden => (
                        <WardenCard key={warden.id} warden={warden} />
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
