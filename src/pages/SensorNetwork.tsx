import {
    Wifi, WifiOff, Battery, Signal, Cpu, AlertTriangle,
    CheckCircle, Radio, Activity, BatteryWarning, Search, Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useSensorNetwork, type SensorNode } from '@/hooks/useSensorNetwork';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const statusConfig = {
    online: { label: 'Online', icon: CheckCircle, className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    warning: { label: 'Warning', icon: AlertTriangle, className: 'bg-amber-50 text-amber-700 border border-amber-200' },
    critical: { label: 'Critical', icon: AlertTriangle, className: 'bg-rose-50 text-rose-700 border border-rose-200' },
    offline: { label: 'Offline', icon: WifiOff, className: 'bg-slate-100 text-slate-500 border-slate-200 border' },
};

const tinymlConfig = {
    normal: { label: 'Normal', className: 'text-emerald-600' },
    anomaly_detected: { label: '⚠️ Anomaly Detected', className: 'text-rose-600 font-bold animate-pulse' },
    processing: { label: 'Processing…', className: 'text-amber-600' },
};

function SignalBars({ strength }: { strength: number }) {
    const bars = Math.ceil(strength / 25);
    return (
        <div className="flex items-end gap-1 h-3.5">
            {[1, 2, 3, 4].map(b => (
                <div
                    key={b}
                    className={cn(
                        'w-1.5 rounded-sm transition-colors',
                        b <= bars ? 'bg-emerald-500' : 'bg-slate-200',
                    )}
                    style={{ height: `${b * 25}%` }}
                />
            ))}
        </div>
    );
}

function SensorCard({ node }: { node: SensorNode }) {
    const status = statusConfig[node.status];
    const StatusIcon = status.icon;
    const tinyml = tinymlConfig[node.tinymlStatus];

    const isAlarming = node.status === 'critical' || node.tinymlStatus === 'anomaly_detected';

    return (
        <div className={cn(
            'bg-white border border-slate-200 rounded-xl shadow-sm p-5 transition-all hover:shadow-md hover:border-sky-300 relative overflow-hidden',
            isAlarming && 'border-rose-400 shadow-rose-100 shadow-md',
            node.status === 'offline' && 'opacity-60 bg-slate-50',
        )}>
            {isAlarming && <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />}

            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] uppercase font-bold text-slate-400 tracking-widest">{node.id}</span>
                            <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center', status.className)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                            </span>
                        </div>
                        <h3 className="font-bold text-base text-slate-900 truncate">{node.name}</h3>
                        <p className="text-xs font-medium text-slate-500">{node.location}</p>
                    </div>
                </div>

                {/* Current Reading */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 text-center shadow-inner">
                    <p className={cn(
                        'text-4xl font-extrabold tabular-nums tracking-tight',
                        node.status === 'critical' ? 'text-rose-600' :
                            node.status === 'warning' ? 'text-amber-600' : 'text-slate-900'
                    )}>
                        {node.status === 'offline' ? '—' : node.currentReading.toFixed(2)}
                        <span className="text-sm font-semibold text-slate-500 ml-1">{node.readingUnit}</span>
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-2">
                        Warn: {node.warningThreshold}{node.readingUnit} / Crit: {node.criticalThreshold}{node.readingUnit}
                    </p>
                </div>

                {/* TinyML Status */}
                <div className="flex items-center gap-2 bg-sky-50/50 border border-sky-100 rounded-md px-3 py-2.5">
                    <Cpu className="h-4 w-4 text-[#005587] flex-shrink-0" />
                    <span className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">Edge Inference:</span>
                    <span className={cn('text-xs font-bold', tinyml.className)}>{tinyml.label}</span>
                </div>

                {/* Battery & Signal */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            {node.battery < 25 ? (
                                <BatteryWarning className="h-3.5 w-3.5 text-amber-500" />
                            ) : (
                                <Battery className="h-3.5 w-3.5 text-slate-400" />
                            )}
                            <span className={node.battery < 25 ? "text-amber-600" : ""}>{node.battery}% Pwr</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn("h-full", node.battery < 25 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${node.battery}%` }} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <Signal className="h-3.5 w-3.5 text-[#005587]" />
                            <span>Mesh {node.signalStrength}%</span>
                        </div>
                        <SignalBars strength={node.signalStrength} />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded text-[10px] font-bold uppercase text-slate-600">
                        <Users className="h-3 w-3 text-slate-400" />
                        {node.assignedWarden}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{node.lastUpdated}</span>
                </div>
            </div>
        </div>
    );
}

export default function SensorNetwork() {
    const { nodes, stats } = useSensorNetwork();
    const [search, setSearch] = useState('');

    const filtered = nodes.filter(
        n => n.name.toLowerCase().includes(search.toLowerCase()) ||
            n.id.toLowerCase().includes(search.toLowerCase()) ||
            n.location.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                                <Radio className="h-6 w-6 text-[#005587]" />
                                Sensor Network Operations
                            </h1>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1.5">
                                Live LoRaWAN Node Health & Telemetry
                            </p>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by Node ID or Sector..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9 h-10 border-slate-200 bg-white shadow-sm focus-visible:ring-[#005587]"
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-px rounded-xl border border-slate-200 overflow-hidden bg-slate-200 shadow-sm">
                        {[
                            { label: 'Total Active', value: stats.total, icon: Radio, textCol: 'text-slate-900', iconCol: 'text-[#005587]' },
                            { label: 'Nodes Online', value: stats.online, icon: CheckCircle, textCol: 'text-emerald-700', iconCol: 'text-emerald-500' },
                            { label: 'Warning Status', value: stats.warning, icon: AlertTriangle, textCol: 'text-amber-600', iconCol: 'text-amber-500' },
                            { label: 'Critical Alert', value: stats.critical, icon: AlertTriangle, textCol: 'text-rose-600', iconCol: 'text-rose-500' },
                            { label: 'Offline / Dead', value: stats.offline, icon: WifiOff, textCol: 'text-slate-500', iconCol: 'text-slate-400' },
                            { label: 'Avg Pwr Level', value: `${stats.avgBattery}%`, icon: Battery, textCol: 'text-emerald-700', iconCol: 'text-emerald-500' },
                        ].map((s, i) => (
                            <div key={i} className="bg-white p-5 flex flex-col justify-center gap-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <s.icon className={cn('h-4 w-4', s.iconCol)} />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                                </div>
                                <p className={cn("text-2xl font-extrabold tracking-tight", s.textCol)}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Live indicator */}
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#005587] bg-sky-50 border border-sky-100 py-1.5 px-3 rounded-full w-fit">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#005587] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#005587]" />
                        </span>
                        <span>Uplink Active — Synced 3s ago</span>
                    </div>

                    {/* Sensor Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filtered.map(node => (
                            <SensorCard key={node.id} node={node} />
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl border-dashed">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">No corresponding nodes found.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
