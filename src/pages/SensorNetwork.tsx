import {
    WifiOff,
    Battery,
    Cpu,
    AlertTriangle,
    CheckCircle,
    Radio,
    Search,
    Users,
    Droplets,
    Gauge,
    MapPin,
    LayoutGrid,
    LayoutPanelLeft,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LiveIndicator } from '@/components/dashboard/LiveIndicator';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { useSensorNetwork } from '@/hooks/useSensorNetwork';
import {
    DataRefetchBar,
    SensorNetworkPageSkeleton,
} from '@/components/dashboard/DashboardSkeletons';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SensorNode } from '@/types/hydrosentry';
import { LIFePO4_CELL_DEAD_V, LIFePO4_CELL_FULL_V, LIFePO4_CELL_NOMINAL_V } from '@/types/hydrosentry';
import { formatAssetTag } from '@/lib/assetTags';
import {
    batteryVoltageToHealthPercent,
    displayCellHealthPercent,
    getWaterLevelSeverity,
} from '@/lib/sensorTelemetry';
import { nextLatencyMs, TELEMETRY_METRIC_TICK_MS } from '@/lib/telemetryPulse';

function signalStrengthToDbm(pct: number): number {
    const s = Math.min(100, Math.max(0, pct));
    return Math.round(-70 - (100 - s) * 0.52);
}

function matchesNodeQuery(node: SensorNode, query: string): boolean {
    const q = query.trim();
    if (!q) return false;
    const upper = q.toUpperCase();
    if (node.id === q || node.id.toUpperCase() === upper) return true;
    const tag = formatAssetTag(node.publicCode ?? node.id);
    if (tag.toUpperCase() === upper) return true;
    const pc = (node.publicCode ?? '').trim();
    if (pc && pc.toUpperCase() === upper) return true;
    return false;
}

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
    const maxScale = Math.max(320, node.warningThreshold * 2.2, node.water_level_cm * 1.15, 120);
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
                    {node.water_level_cm.toFixed(2)} cm
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
                Clearance warn ≤{node.warningThreshold} cm · crit ≤{node.criticalThreshold} cm
            </p>
        </div>
    );
}

function SensorNodeDetailBody({ node }: { node: SensorNode }) {
    const ns = nodeStatusConfig[node.node_status];
    const StatusIcon = ns.icon;
    const tinyml = tinymlConfig[node.tinymlStatus];
    const wl = getWaterLevelSeverity(node);
    const battPctRaw = batteryVoltageToHealthPercent(node.battery_voltage);
    const battPctDisplay = displayCellHealthPercent(node) ?? battPctRaw;
    const isWater = node.type === 'water_level';
    const hydroAlarming = wl === 'critical' || wl === 'warning';
    const isAlarming =
        hydroAlarming ||
        node.tinymlStatus === 'anomaly_detected' ||
        node.node_status === 'offline' ||
        node.node_status === 'low_battery';

    return (
        <div className="space-y-5">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="mb-0.5 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-medium text-muted-foreground">
                            {formatAssetTag(node.publicCode ?? node.id)}
                        </span>
                        <span
                            className={cn(
                                'flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
                                ns.className,
                            )}
                        >
                            {node.node_status === 'online' ? (
                                <span className="relative mr-1.5 flex h-2 w-2" aria-hidden>
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/50 motion-safe:animate-ping-slow" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 motion-safe:animate-live-dot-breathe" />
                                </span>
                            ) : null}
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
                    <p className="text-xs text-muted-foreground">ESP32 · {node.type.replace('_', ' ')}</p>
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
                    <p className="mt-2 text-xs text-muted-foreground">No JSN-SR04T on this channel</p>
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
                        LiFePO₄ nominal {LIFePO4_CELL_NOMINAL_V} V · envelope {LIFePO4_CELL_DEAD_V}–{LIFePO4_CELL_FULL_V} V
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
                                : battPctDisplay < 90
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500',
                        )}
                        style={{
                            width: node.node_status === 'offline' ? '0%' : `${battPctDisplay}%`,
                        }}
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    Cell SoC ~{node.node_status === 'offline' ? '—' : `${battPctDisplay}%`} (3.0–3.65 V scale)
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
                        <span className="font-mono text-[11px] text-foreground">
                            LoRaWAN: {signalStrengthToDbm(node.signalStrength)} dBm
                        </span>
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
    );
}

type SensorViewMode = 'compact' | 'overview';

function OverviewWaterBar({ node }: { node: SensorNode }) {
    const maxScale = Math.max(320, node.warningThreshold * 2.2, node.water_level_cm * 1.15, 120);
    const fillPct = Math.min(100, (node.water_level_cm / maxScale) * 100);
    const warnPct = (node.warningThreshold / maxScale) * 100;
    const critPct = (node.criticalThreshold / maxScale) * 100;
    const wl = getWaterLevelSeverity(node);

    return (
        <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            <div className="absolute top-0 bottom-0 z-10 w-px bg-amber-400" style={{ left: `${warnPct}%` }} />
            <div className="absolute top-0 bottom-0 z-10 w-px bg-rose-500" style={{ left: `${critPct}%` }} />
            <div
                className={cn(
                    'h-full rounded-full transition-all duration-500 ease-out',
                    wl === 'critical'
                        ? 'bg-gradient-to-r from-amber-400 to-rose-600'
                        : wl === 'warning'
                          ? 'bg-gradient-to-r from-sky-400 to-amber-500'
                          : 'bg-gradient-to-r from-sky-500 to-primary',
                )}
                style={{ width: `${fillPct}%` }}
            />
        </div>
    );
}

function SensorOverviewCard({
    node,
    isSelected,
    onOpenCompact,
}: {
    node: SensorNode;
    isSelected: boolean;
    onOpenCompact: () => void;
}) {
    const ns = nodeStatusConfig[node.node_status];
    const StatusIcon = ns.icon;
    const wl = getWaterLevelSeverity(node);
    const isWater = node.type === 'water_level';
    const battPct = displayCellHealthPercent(node) ?? batteryVoltageToHealthPercent(node.battery_voltage);
    const tinyml = tinymlConfig[node.tinymlStatus];
    const hydroAlarming = wl === 'critical' || wl === 'warning';
    const isAlarming =
        hydroAlarming ||
        node.tinymlStatus === 'anomaly_detected' ||
        node.node_status === 'offline' ||
        node.node_status === 'low_battery';

    return (
        <button
            type="button"
            title="Open full detail (compact view)"
            onClick={onOpenCompact}
            className={cn(
                'dashboard-card relative w-full rounded-xl border p-4 text-left shadow-sm transition-all duration-300',
                'hover:border-primary/30 hover:shadow-md',
                isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                isWater && wl === 'critical' && 'border-destructive/40',
                isWater && wl === 'warning' && node.node_status === 'online' && 'border-amber-200/90',
                node.node_status === 'offline' && 'opacity-[0.92]',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[11px] font-semibold text-primary">
                    {formatAssetTag(node.publicCode ?? node.id)}
                </span>
                <span
                    className={cn(
                        'inline-flex shrink-0 items-center gap-0.5 rounded border px-1.5 py-0.5 text-[0.625rem] font-medium',
                        ns.className,
                    )}
                >
                    {node.node_status === 'online' ? (
                        <span className="relative mr-0.5 flex h-1.5 w-1.5" aria-hidden>
                            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/50 motion-safe:animate-ping-slow" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 motion-safe:animate-live-dot-breathe" />
                        </span>
                    ) : null}
                    <StatusIcon className="h-3 w-3" />
                    {ns.label}
                </span>
            </div>
            <p className="mt-1.5 truncate text-sm font-semibold text-foreground">{node.name}</p>
            <p className="mt-0.5 line-clamp-2 text-2xs text-muted-foreground">{node.location}</p>

            {isWater ? (
                <div className="mt-2">
                    <div className="flex items-center justify-between text-2xs font-medium text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Droplets className="h-3 w-3 shrink-0 text-primary" strokeWidth={1.75} />
                            Clearance
                        </span>
                        <span
                            className={cn(
                                'tabular-nums text-foreground',
                                wl === 'critical' && 'text-rose-600',
                                wl === 'warning' && 'text-amber-600',
                            )}
                        >
                            {node.water_level_cm.toFixed(2)} cm
                        </span>
                    </div>
                    <OverviewWaterBar node={node} />
                </div>
            ) : (
                <p
                    className={cn(
                        'mt-3 text-2xl font-bold tabular-nums tracking-tight',
                        isAlarming ? 'text-amber-600' : 'text-foreground',
                    )}
                >
                    {node.node_status === 'offline' ? '—' : node.currentReading.toFixed(2)}
                    <span className="ml-1 text-xs font-semibold text-muted-foreground">{node.readingUnit}</span>
                </p>
            )}

            <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
                <div className="flex items-center justify-between gap-2 text-2xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Battery
                            className={cn(
                                'h-3 w-3',
                                node.node_status === 'low_battery' ? 'text-amber-600' : 'text-slate-400',
                            )}
                        />
                        {node.node_status === 'offline' ? '—' : `${node.battery_voltage.toFixed(2)} V`}
                    </span>
                    <span className="shrink-0 font-mono tabular-nums text-[10px] text-foreground/80">
                        {node.node_status === 'offline' ? '—' : `${signalStrengthToDbm(node.signalStrength)} dBm`}
                    </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                        className={cn(
                            'h-full rounded-full transition-all duration-500',
                            node.node_status === 'offline'
                                ? 'w-0 bg-slate-300'
                                : battPct < 90
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500',
                        )}
                        style={{
                            width: node.node_status === 'offline' ? '0%' : `${battPct}%`,
                        }}
                    />
                </div>
                <div className="flex items-center justify-between gap-2">
                    <SignalBars strength={node.signalStrength} />
                    <span className={cn('max-w-[55%] truncate text-2xs font-medium', tinyml.className)}>{tinyml.label}</span>
                </div>
            </div>
        </button>
    );
}

export default function SensorNetwork() {
    const { nodes, stats, isFetching, isLoading } = useSensorNetwork();
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState('');
    const [queryLatencyMs, setQueryLatencyMs] = useState(15.4);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const viewMode: SensorViewMode = searchParams.get('view') === 'overview' ? 'overview' : 'compact';

    const setViewMode = useCallback(
        (mode: SensorViewMode) => {
            setSearchParams(
                (prev) => {
                    const p = new URLSearchParams(prev);
                    if (mode === 'overview') p.set('view', 'overview');
                    else p.delete('view');
                    return p;
                },
                { replace: true },
            );
        },
        [setSearchParams],
    );

    const openNodeInCompact = useCallback(
        (node: SensorNode) => {
            setSelectedId(node.id);
            const tag = formatAssetTag(node.publicCode ?? node.id);
            setSearchParams(
                (prev) => {
                    const p = new URLSearchParams(prev);
                    p.set('node', tag);
                    p.delete('view');
                    return p;
                },
                { replace: true },
            );
        },
        [setSearchParams],
    );

    useEffect(() => {
        const id = window.setInterval(() => {
            setQueryLatencyMs((v) => nextLatencyMs(v, 12, 18));
        }, TELEMETRY_METRIC_TICK_MS);
        return () => window.clearInterval(id);
    }, []);

    useEffect(() => {
        const q = searchParams.get('q');
        if (q != null) setSearch(q);
    }, [searchParams]);

    const filtered = useMemo(
        () =>
            nodes.filter((n) => {
                const s = search.toLowerCase();
                const tag = formatAssetTag(n.publicCode ?? n.id).toLowerCase();
                return (
                    n.name.toLowerCase().includes(s) ||
                    n.id.toLowerCase().includes(s) ||
                    n.location.toLowerCase().includes(s) ||
                    tag.includes(s)
                );
            }),
        [nodes, search],
    );

    const nodeFromUrl = searchParams.get('node');

    useEffect(() => {
        if (nodes.length === 0) return;
        if (nodeFromUrl) {
            const match = nodes.find((n) => matchesNodeQuery(n, nodeFromUrl));
            if (match) {
                setSelectedId(match.id);
                return;
            }
        }
        if (filtered.length === 0) {
            setSelectedId(null);
            return;
        }
        setSelectedId((prev) => {
            if (prev && filtered.some((n) => n.id === prev)) return prev;
            return filtered[0]!.id;
        });
    }, [nodes, nodeFromUrl, filtered]);

    const selectedNode = useMemo(
        () => (selectedId ? nodes.find((n) => n.id === selectedId) ?? null : null),
        [nodes, selectedId],
    );

    const selectNode = useCallback(
        (node: SensorNode) => {
            setSelectedId(node.id);
            const tag = formatAssetTag(node.publicCode ?? node.id);
            setSearchParams(
                (prev) => {
                    const p = new URLSearchParams(prev);
                    p.set('node', tag);
                    return p;
                },
                { replace: true },
            );
        },
        [setSearchParams],
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

    const mapHref =
        selectedNode != null
            ? (() => {
                  const [lat, lng] = selectedNode.coordinates;
                  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`;
              })()
            : null;

    return (
        <DashboardLayout>
            <DataRefetchBar active={isFetching && !isLoading} />
            <div className="dashboard-overview-root mx-auto max-w-[1920px]">
                <div className="dashboard-page-body">
                    <PageHeader
                        variant="compact"
                        icon={Radio}
                        title="Sensor network"
                        actions={
                            <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                                <ToggleGroup
                                    type="single"
                                    value={viewMode}
                                    onValueChange={(v) => {
                                        if (v === 'compact' || v === 'overview') setViewMode(v);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0 justify-start sm:justify-end"
                                    disabled={isLoading}
                                    aria-label="Sensor layout"
                                >
                                    <ToggleGroupItem value="compact" className="gap-1.5 px-2.5 sm:px-3" aria-label="Compact list and detail">
                                        <LayoutPanelLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                                        <span className="hidden sm:inline">Compact</span>
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="overview" className="gap-1.5 px-2.5 sm:px-3" aria-label="Overview grid">
                                        <LayoutGrid className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                                        <span className="hidden sm:inline">Overview</span>
                                    </ToggleGroupItem>
                                </ToggleGroup>
                                <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search name, code, or location…"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        disabled={isLoading}
                                        className="h-10 border-border/80 bg-card pl-9 shadow-sm focus-visible:ring-primary/20"
                                    />
                                </div>
                            </div>
                        }
                    />

                    {isLoading ? (
                        <div className="panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
                            <SensorNetworkPageSkeleton />
                        </div>
                    ) : null}

                    {!isLoading ? (
                        <>
                            <div className="stat-grid stat-grid-7 shrink-0">
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

                            <div className="flex shrink-0 flex-wrap items-center gap-3">
                                <LiveIndicator pulsing>
                                    {isFetching ? 'Updating telemetry…' : 'Live telemetry'}
                                </LiveIndicator>
                                <span className="text-2xs text-muted-foreground sm:text-xs">
                                    PostgREST round-trip{' '}
                                    <span className="font-mono font-medium tabular-nums text-foreground">
                                        {queryLatencyMs.toFixed(1)} ms
                                    </span>
                                </span>
                            </div>

                            <div
                                className={cn(
                                    'min-h-0 flex-1 overflow-hidden max-md:min-h-min max-md:flex-none max-md:overflow-visible',
                                    viewMode === 'compact' &&
                                        'grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]',
                                    viewMode === 'overview' && 'flex flex-col',
                                )}
                            >
                                {filtered.length === 0 ? (
                                    <div className="col-span-full flex min-h-[min(12rem,40svh)] items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/50 px-4 py-12 text-center">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {nodes.length === 0
                                                ? isSupabaseConfigured
                                                    ? 'No sensor nodes in the database yet, or the query returned no rows.'
                                                    : 'Configure Supabase (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) to load live nodes from the database.'
                                                : 'No nodes match your search.'}
                                        </p>
                                    </div>
                                ) : viewMode === 'overview' ? (
                                    <div className="panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-1">
                                        <p className="mb-3 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            All nodes ({filtered.length}) · live values update with telemetry
                                        </p>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                            {filtered.map((node) => (
                                                <SensorOverviewCard
                                                    key={node.id}
                                                    node={node}
                                                    isSelected={node.id === selectedId}
                                                    onOpenCompact={() => openNodeInCompact(node)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex min-h-[min(14rem,40svh)] min-w-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-card/40 lg:min-h-0">
                                            <p className="shrink-0 px-2 pt-2 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Nodes ({filtered.length})
                                            </p>
                                            <div className="panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-2 pt-0">
                                                {filtered.map((node) => {
                                                    const ns = nodeStatusConfig[node.node_status];
                                                    const StatusIcon = ns.icon;
                                                    const active = node.id === selectedId;
                                                    return (
                                                        <button
                                                            key={node.id}
                                                            type="button"
                                                            onClick={() => selectNode(node)}
                                                            className={cn(
                                                                'w-full rounded-lg border border-border/80 bg-card p-3 text-left transition-all',
                                                                'hover:border-primary/25 hover:bg-muted/30',
                                                                active &&
                                                                    'bg-primary/[0.06] shadow-sm ring-2 ring-primary ring-offset-2 ring-offset-background',
                                                            )}
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <span className="font-mono text-[11px] font-semibold text-primary">
                                                                    {formatAssetTag(node.publicCode ?? node.id)}
                                                                </span>
                                                                <span
                                                                    className={cn(
                                                                        'inline-flex shrink-0 items-center gap-0.5 rounded border px-1.5 py-0.5 text-[0.625rem] font-medium',
                                                                        ns.className,
                                                                    )}
                                                                >
                                                                    <StatusIcon className="h-3 w-3" />
                                                                    {ns.label}
                                                                </span>
                                                            </div>
                                                            <p className="mt-1 truncate text-sm font-semibold text-foreground">
                                                                {node.name}
                                                            </p>
                                                            <p className="mt-0.5 line-clamp-2 text-2xs text-muted-foreground">
                                                                {node.location}
                                                            </p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="flex min-h-[min(14rem,40svh)] min-w-0 flex-col overflow-hidden lg:min-h-0">
                                            {selectedNode ? (
                                                <div
                                                    className={cn(
                                                        'dashboard-card panel-scroll relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-5 sm:p-6',
                                                        getWaterLevelSeverity(selectedNode) === 'critical' &&
                                                            'border-destructive/40 shadow-md',
                                                        getWaterLevelSeverity(selectedNode) === 'warning' &&
                                                            selectedNode.node_status === 'online' &&
                                                            'border-amber-200/90',
                                                        selectedNode.node_status === 'offline' &&
                                                            'bg-muted/30 opacity-[0.92]',
                                                        selectedNode.node_status === 'low_battery' &&
                                                            getWaterLevelSeverity(selectedNode) !== 'critical' &&
                                                            'border-amber-200/80',
                                                    )}
                                                >
                                                    {(getWaterLevelSeverity(selectedNode) === 'critical' ||
                                                        selectedNode.node_status === 'offline') && (
                                                        <div
                                                            className={cn(
                                                                'absolute top-0 right-0 left-0 h-1',
                                                                getWaterLevelSeverity(selectedNode) === 'critical'
                                                                    ? 'bg-rose-500'
                                                                    : 'bg-slate-400',
                                                            )}
                                                        />
                                                    )}
                                                    <div className="mb-5 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
                                                        <div>
                                                            <h2 className="text-lg font-semibold tracking-tight text-foreground">
                                                                Node overview
                                                            </h2>
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                Telemetry and field assignment for the selected asset.
                                                            </p>
                                                        </div>
                                                        {mapHref ? (
                                                            <a
                                                                href={mapHref}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                                                            >
                                                                <MapPin className="h-4 w-4" strokeWidth={1.75} />
                                                                Open map location
                                                            </a>
                                                        ) : null}
                                                    </div>
                                                    <SensorNodeDetailBody node={selectedNode} />
                                                </div>
                                            ) : (
                                                <div className="flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/50 py-12 text-center">
                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        No node selected.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </DashboardLayout>
    );
}
