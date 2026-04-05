import {
    WifiOff,
    Battery,
    Signal,
    Cpu,
    AlertTriangle,
    CheckCircle,
    Radio,
    Search,
    Users,
    Droplets,
    Gauge,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LiveIndicator } from '@/components/dashboard/LiveIndicator';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { useSensorNetwork } from '@/hooks/useSensorNetwork';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SensorNode } from '@/types/hydrosentry';
import { LIFePO4_CELL_NOMINAL_V } from '@/types/hydrosentry';
import {
    batteryVoltageToHealthPercent,
    getWaterLevelSeverity,
} from '@/lib/sensorTelemetry';

const nodeStatusConfig = {
    online: {
        label: 'Online',
        icon: CheckCircle,
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    offline: {
        label: 'Offline',
        icon: WifiOff,
        className: 'bg-slate-100 text-slate-500 border border-slate-200',
    },
    low_battery: {
        label: 'Low battery',
        icon: Battery,
        className: 'bg-amber-50 text-amber-800 border border-amber-200',
    },
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
            {[1, 2, 3, 4].map((b) => (
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

function WaterLevelGauge({ node }: { node: SensorNode }) {
    const maxScale = Math.max(node.criticalThreshold * 1.15, node.water_level_cm * 1.08, 120);
    const fillPct = Math.min(100, (node.water_level_cm / maxScale) * 100);
    const warnPct = (node.warningThreshold / maxScale) * 100;
    const critPct = (node.criticalThreshold / maxScale) * 100;
    const wl = getWaterLevelSeverity(node);

    return (
        <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                    JSN-SR04T depth
                </span>
                <span
                    className={cn(
                        'tabular-nums',
                        wl === 'critical' && 'text-rose-600',
                        wl === 'warning' && 'text-amber-600',
                        wl === 'normal' && 'text-slate-800',
                    )}
                >
                    {node.water_level_cm.toFixed(1)} cm
                </span>
            </div>
            <div className="relative h-3 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div
                    className="absolute top-0 bottom-0 w-px bg-amber-400 z-10"
                    style={{ left: `${warnPct}%` }}
                    title="Warning threshold"
                />
                <div
                    className="absolute top-0 bottom-0 w-px bg-rose-500 z-10"
                    style={{ left: `${critPct}%` }}
                    title="Critical threshold"
                />
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-500',
                        wl === 'critical'
                            ? 'bg-gradient-to-r from-amber-400 to-rose-600'
                            : wl === 'warning'
                              ? 'bg-gradient-to-r from-sky-400 to-amber-500'
                              : 'bg-gradient-to-r from-sky-500 to-primary',
                    )}
                    style={{ width: `${fillPct}%` }}
                />
            </div>
            <p className="text-xs text-muted-foreground">
                Warn {node.warningThreshold} cm · Crit {node.criticalThreshold} cm
            </p>
        </div>
    );
}

function SensorCard({ node }: { node: SensorNode }) {
    const ns = nodeStatusConfig[node.node_status];
    const StatusIcon = ns.icon;
    const tinyml = tinymlConfig[node.tinymlStatus];
    const wl = getWaterLevelSeverity(node);
    const battPct = batteryVoltageToHealthPercent(node.battery_voltage);
    const isWater = node.type === 'water_level';
    const hydroAlarming = wl === 'critical' || wl === 'warning';
    const isAlarming =
        hydroAlarming ||
        node.tinymlStatus === 'anomaly_detected' ||
        node.node_status === 'offline' ||
        node.node_status === 'low_battery';

    return (
        <div
            className={cn(
                'dashboard-card relative overflow-hidden p-5 transition-colors duration-200 hover:border-muted-foreground/15 sm:p-6',
                wl === 'critical' && 'border-destructive/40 shadow-md',
                wl === 'warning' && node.node_status === 'online' && 'border-amber-200/90',
                node.node_status === 'offline' && 'bg-muted/30 opacity-[0.72]',
                node.node_status === 'low_battery' && wl !== 'critical' && 'border-amber-200/80',
            )}
        >
            {(wl === 'critical' || node.node_status === 'offline') && (
                <div
                    className={cn(
                        'absolute top-0 left-0 right-0 h-1',
                        wl === 'critical' ? 'bg-rose-500' : 'bg-slate-400',
                    )}
                />
            )}

            <div className="space-y-5">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="mb-0.5 flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-medium text-muted-foreground">
                                {node.publicCode ?? node.id}
                            </span>
                            <span
                                className={cn(
                                    'flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
                                    ns.className,
                                )}
                            >
                                <StatusIcon className="mr-1 h-3.5 w-3.5" />
                                {ns.label}
                            </span>
                            {isWater && wl !== 'n/a' && (
                                <span
                                    className={cn(
                                        'rounded-md border px-2 py-0.5 text-xs font-medium',
                                        wl === 'critical' && 'bg-rose-50 text-rose-700 border-rose-200',
                                        wl === 'warning' && 'bg-amber-50 text-amber-800 border-amber-200',
                                        wl === 'normal' && 'bg-slate-50 text-slate-600 border-slate-200',
                                    )}
                                >
                                    H₂O {wl}
                                </span>
                            )}
                        </div>
                        <h3 className="truncate text-base font-semibold text-foreground">{node.name}</h3>
                        <p className="text-xs text-muted-foreground">{node.location}</p>
                        <p className="text-xs text-muted-foreground">
                            ESP32 · {node.type.replace('_', ' ')}
                        </p>
                    </div>
                </div>

                {isWater ? (
                    <WaterLevelGauge node={node} />
                ) : (
                    <div className="rounded-lg border border-border bg-muted/25 p-4 text-center">
                        <p
                            className={cn(
                                'text-3xl font-extrabold tabular-nums tracking-tight',
                                isAlarming ? 'text-amber-600' : 'text-slate-900',
                            )}
                        >
                            {node.node_status === 'offline' ? '—' : node.currentReading.toFixed(2)}
                            <span className="text-sm font-semibold text-slate-500 ml-1">{node.readingUnit}</span>
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                            No JSN-SR04T on this channel
                        </p>
                    </div>
                )}

                <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3.5">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Battery
                                className={cn(
                                    'h-3.5 w-3.5',
                                    node.node_status === 'low_battery' ? 'text-amber-600' : 'text-slate-400',
                                )}
                            />
                            LiFePO₄ {LIFePO4_CELL_NOMINAL_V} V nominal
                        </span>
                        <span className="tabular-nums text-slate-800">
                            {node.node_status === 'offline' ? '—' : `${node.battery_voltage.toFixed(2)} V`}
                        </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                'h-full rounded-full transition-all',
                                node.node_status === 'offline'
                                    ? 'bg-slate-300 w-0'
                                    : battPct < 90
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500',
                            )}
                            style={{
                                width: node.node_status === 'offline' ? '0%' : `${battPct}%`,
                            }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Cell health ~{node.node_status === 'offline' ? '—' : `${battPct}%`} of nominal
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-2.5">
                    <Cpu className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                    <span className="text-xs font-medium text-muted-foreground">Edge inference</span>
                    <span className={cn('text-sm font-semibold', tinyml.className)}>{tinyml.label}</span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <Radio className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                            <span>Mesh {node.signalStrength}%</span>
                        </div>
                        <SignalBars strength={node.signalStrength} />
                    </div>
                    <div className="space-y-1 text-xs leading-snug text-muted-foreground">
                        <p className="font-medium">Firmware</p>
                        <p className="font-mono text-foreground">{node.firmwareVersion}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1 text-xs font-medium text-foreground">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {node.assignedWarden}
                    </div>
                    <span className="text-xs text-muted-foreground">{node.lastUpdated}</span>
                </div>
            </div>
        </div>
    );
}

export default function SensorNetwork() {
    const { nodes, stats, isFetching } = useSensorNetwork();
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState('');

    useEffect(() => {
        const q = searchParams.get('q');
        if (q != null) setSearch(q);
    }, [searchParams]);

    const filtered = nodes.filter(
        (n) =>
            n.name.toLowerCase().includes(search.toLowerCase()) ||
            n.id.toLowerCase().includes(search.toLowerCase()) ||
            n.location.toLowerCase().includes(search.toLowerCase()),
    );

    const statTiles = [
        { label: 'Total Nodes', value: stats.total, icon: Radio, col: 'text-foreground', ico: 'text-primary' },
        { label: 'Online', value: stats.online, icon: CheckCircle, col: 'text-emerald-700', ico: 'text-emerald-500' },
        {
            label: 'Low LiFePO₄',
            value: stats.lowBattery,
            icon: Battery,
            col: 'text-amber-700',
            ico: 'text-amber-500',
        },
        {
            label: 'Hydro Warning',
            value: stats.hydroWarning,
            icon: AlertTriangle,
            col: 'text-amber-600',
            ico: 'text-amber-500',
        },
        {
            label: 'Hydro Critical',
            value: stats.hydroCritical,
            icon: AlertTriangle,
            col: 'text-rose-600',
            ico: 'text-rose-500',
        },
        { label: 'Offline', value: stats.offline, icon: WifiOff, col: 'text-slate-500', ico: 'text-slate-400' },
        {
            label: 'Avg cell V',
            value: `${stats.avgBatteryVoltage.toFixed(2)} V`,
            icon: Gauge,
            col: 'text-sky-800',
            ico: 'text-sky-600',
        },
    ];

    return (
        <DashboardLayout>
            <div className="dashboard-shell">
                <PageHeader
                    variant="compact"
                    icon={Radio}
                    title="Sensor network"
                    actions={
                        <div className="relative w-full min-w-[200px] sm:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search name, code, or location…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-10 border-border/80 bg-card pl-9 shadow-sm focus-visible:ring-primary/20"
                            />
                        </div>
                    }
                />

                <div className="stat-grid stat-grid-7">
                    {statTiles.map((s, i) => (
                        <div key={i} className="stat-tile">
                            <div className="stat-tile-head">
                                <s.icon className={cn('h-4 w-4 shrink-0', s.ico)} strokeWidth={1.75} />
                                <p className="stat-tile-label">{s.label}</p>
                            </div>
                            <p className={cn('stat-tile-value truncate', s.col)}>{s.value}</p>
                        </div>
                    ))}
                </div>

                <LiveIndicator pulsing={isFetching}>
                    {isFetching ? 'Updating telemetry…' : 'Live telemetry'}
                </LiveIndicator>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((node) => (
                        <SensorCard key={node.id} node={node} />
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-card/50 py-20 text-center">
                        <p className="text-sm font-medium text-muted-foreground">No nodes match your search.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
