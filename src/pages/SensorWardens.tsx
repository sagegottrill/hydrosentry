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
    completed: { label: 'Completed', icon: CheckCircle, className: 'bg-success/10 text-success border-success/20' },
    in_progress: { label: 'In Progress', icon: Clock, className: 'bg-warning/10 text-warning border-warning/20' },
    pending: { label: 'Pending', icon: AlertCircle, className: 'bg-muted text-muted-foreground border-muted' },
};

const stipendConfig = {
    paid: { label: 'Paid', className: 'bg-success/10 text-success border-success/20' },
    pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
    overdue: { label: 'Overdue', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

function WardenCard({ warden }: { warden: SensorWarden }) {
    const training = trainingConfig[warden.trainingStatus];
    const stipend = stipendConfig[warden.stipendStatus];
    const TrainingIcon = training.icon;
    const completedModules = warden.trainingModules.filter(m => m.completed).length;
    const totalModules = warden.trainingModules.length;

    return (
        <Card className="hover:shadow-md transition-all">
            <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                            warden.gender === 'female'
                                ? 'bg-pink-500/10 text-pink-500'
                                : 'bg-blue-500/10 text-blue-500',
                        )}>
                            {warden.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-foreground">{warden.name}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {warden.location}
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className={cn('text-xs', training.className)}>
                        <TrainingIcon className="h-3 w-3 mr-1" />
                        {training.label}
                    </Badge>
                </div>

                {/* Training Progress */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" /> Training Modules
                        </span>
                        <span className="font-medium text-foreground">{completedModules}/{totalModules}</span>
                    </div>
                    <Progress
                        value={(completedModules / totalModules) * 100}
                        className={cn(
                            'h-2',
                            warden.trainingStatus === 'completed' && '[&>div]:bg-success',
                            warden.trainingStatus === 'in_progress' && '[&>div]:bg-warning',
                            warden.trainingStatus === 'pending' && '[&>div]:bg-muted-foreground',
                        )}
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                        {warden.trainingModules.map((mod, i) => (
                            <span
                                key={i}
                                className={cn(
                                    'text-[10px] px-2 py-0.5 rounded-full border',
                                    mod.completed
                                        ? 'bg-success/5 text-success border-success/20'
                                        : 'bg-muted text-muted-foreground border-border',
                                )}
                            >
                                {mod.completed ? '✓' : '○'} {mod.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                    <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{warden.assignedNodes.length}</p>
                        <p className="text-[10px] text-muted-foreground">Nodes</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{warden.incidentsReported}</p>
                        <p className="text-[10px] text-muted-foreground">Incidents</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{warden.maintenanceCompleted}</p>
                        <p className="text-[10px] text-muted-foreground">Maintenance</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                    <Badge variant="outline" className={cn('text-[10px]', stipend.className)}>
                        ₦{warden.monthlyStipend.toLocaleString()}/mo — {stipend.label}
                    </Badge>
                    <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Last: {warden.lastCheckIn}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

export default function SensorWardens() {
    const { wardens, stats } = useSensorWardens();

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-secondary/30 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Users className="h-7 w-7 text-primary" />
                            Sensor Wardens Program
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Youth employment initiative — training, maintaining, and protecting the LoRaWAN sensor network
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {[
                            { label: 'Active Wardens', value: stats.totalWardens, icon: Users, color: 'text-primary' },
                            { label: 'Training Done', value: stats.trainingCompleted, icon: GraduationCap, color: 'text-success' },
                            { label: 'In Training', value: stats.trainingInProgress, icon: Clock, color: 'text-warning' },
                            { label: 'Nodes Covered', value: `${stats.nodesCovered}/${stats.totalNodes}`, icon: Shield, color: 'text-primary' },
                            { label: 'Monthly Budget', value: `₦${(stats.monthlyBudget / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-success' },
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

                    {/* Impact summary */}
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-success" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">₦{stats.totalDisbursed.toLocaleString()} Total Disbursed</p>
                                        <p className="text-xs text-muted-foreground">Direct youth employment payments</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Wrench className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{stats.totalMaintenance} Maintenance Tasks</p>
                                        <p className="text-xs text-muted-foreground">Completed by wardens</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-warning" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{stats.totalIncidents} Incidents Reported</p>
                                        <p className="text-xs text-muted-foreground">Proactive community monitoring</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Warden Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {wardens.map(warden => (
                            <WardenCard key={warden.id} warden={warden} />
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
