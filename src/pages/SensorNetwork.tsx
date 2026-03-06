import {
    Wifi, WifiOff, Battery, Signal, Cpu, AlertTriangle,
    CheckCircle, Radio, Activity, BatteryWarning, Search
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
    online: { label: 'Online', icon: CheckCircle, className: 'bg-success/10 text-success border-success/20' },
    warning: { label: 'Warning', icon: AlertTriangle, className: 'bg-warning/10 text-warning border-warning/20' },
    critical: { label: 'Critical', icon: AlertTriangle, className: 'bg-destructive/10 text-destructive border-destructive/20' },
    offline: { label: 'Offline', icon: WifiOff, className: 'bg-muted text-muted-foreground border-muted' },
};

const tinymlConfig = {
    normal: { label: 'Normal', className: 'text-success' },
    anomaly_detected: { label: '⚠️ Anomaly Detected', className: 'text-destructive font-bold animate-pulse' },
    processing: { label: 'Processing…', className: 'text-warning' },
};

function SignalBars({ strength }: { strength: number }) {
    const bars = Math.ceil(strength / 25);
    return (
        <div className="flex items-end gap-0.5 h-4">
            {[1, 2, 3, 4].map(b => (
                <div
                    key={b}
                    className={cn(
                        'w-1 rounded-sm transition-colors',
                        b <= bars ? 'bg-success' : 'bg-muted',
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
        <Card className={cn(
            'transition-all hover:shadow-md',
            isAlarming && 'ring-2 ring-destructive/50 shadow-destructive/10 shadow-lg',
            node.status === 'offline' && 'opacity-60',
        )}>
            <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">{node.id}</span>
                            <Badge variant="outline" className={cn('text-xs border', status.className)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                            </Badge>
                        </div>
                        <h3 className="font-semibold text-sm text-foreground truncate">{node.name}</h3>
                        <p className="text-xs text-muted-foreground">{node.location}</p>
                    </div>
                </div>

                {/* Current Reading — the big number */}
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                    <p className={cn(
                        'text-3xl font-bold tabular-nums',
                        node.status === 'critical' ? 'text-destructive' :
                            node.status === 'warning' ? 'text-warning' : 'text-foreground'
                    )}>
                        {node.status === 'offline' ? '—' : node.currentReading.toFixed(2)}
                        <span className="text-sm font-normal text-muted-foreground ml-1">{node.readingUnit}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Warn: {node.warningThreshold}{node.readingUnit} / Crit: {node.criticalThreshold}{node.readingUnit}
                    </p>
                </div>

                {/* TinyML Status */}
                <div className="flex items-center gap-2 bg-secondary/30 rounded-md px-3 py-2">
                    <Cpu className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-xs font-medium">TinyML:</span>
                    <span className={cn('text-xs', tinyml.className)}>{tinyml.label}</span>
                </div>

                {/* Battery & Signal */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {node.battery < 25 ? (
                                <BatteryWarning className="h-3.5 w-3.5 text-warning" />
                            ) : (
                                <Battery className="h-3.5 w-3.5" />
                            )}
                            <span>{node.battery}%</span>
                        </div>
                        <Progress
                            value={node.battery}
                            className={cn(
                                'h-1.5',
                                node.battery < 25 && '[&>div]:bg-warning',
                                node.battery >= 25 && '[&>div]:bg-success',
                            )}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Signal className="h-3.5 w-3.5" />
                            <span>LoRa {node.signalStrength}%</span>
                        </div>
                        <SignalBars strength={node.signalStrength} />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                        👤 {node.assignedWarden}
                    </span>
                    <span className="text-xs text-muted-foreground">{node.lastUpdated}</span>
                </div>
            </CardContent>
        </Card>
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
            <div className="min-h-screen bg-secondary/30 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                <Radio className="h-7 w-7 text-primary" />
                                Sensor Network
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Real-time LoRaWAN node health and water level readings
                            </p>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search nodes…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                            { label: 'Total Nodes', value: stats.total, icon: Radio, color: 'text-primary' },
                            { label: 'Online', value: stats.online, icon: CheckCircle, color: 'text-success' },
                            { label: 'Warning', value: stats.warning, icon: AlertTriangle, color: 'text-warning' },
                            { label: 'Critical', value: stats.critical, icon: AlertTriangle, color: 'text-destructive' },
                            { label: 'Offline', value: stats.offline, icon: WifiOff, color: 'text-muted-foreground' },
                            { label: 'Avg Battery', value: `${stats.avgBattery}%`, icon: Battery, color: 'text-success' },
                        ].map((s, i) => (
                            <Card key={i}>
                                <CardContent className="p-4 flex items-center gap-3">
                                    <s.icon className={cn('h-5 w-5', s.color)} />
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">{s.value}</p>
                                        <p className="text-xs text-muted-foreground">{s.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Live indicator */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                        </span>
                        <span>Live — updating every 3 seconds</span>
                    </div>

                    {/* Sensor Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map(node => (
                            <SensorCard key={node.id} node={node} />
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            No sensors match your search.
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
