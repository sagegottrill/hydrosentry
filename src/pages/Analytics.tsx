import { useEffect, useMemo, useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';
import { BarChart3, TrendingUp, Droplets } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LiveIndicator } from '@/components/dashboard/LiveIndicator';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { useSensorNetwork, type ReadingPoint } from '@/hooks/useSensorNetwork';
import {
    AnalyticsPageSkeleton,
    DataRefetchBar,
} from '@/components/dashboard/DashboardSkeletons';
import { cn } from '@/lib/utils';
import { getWaterLevelSeverity } from '@/lib/sensorTelemetry';
import { formatAssetTag } from '@/lib/assetTags';
import type { SensorNode } from '@/types/hydrosentry';
import { LIFePO4_CELL_NOMINAL_V } from '@/types/hydrosentry';
import {
    appendReadingPoint,
    nextWaterClearanceCm,
    syntheticWaterHistory,
    TELEMETRY_CHART_TICK_MS,
} from '@/lib/telemetryPulse';

const CHART_PRIMARY = 'hsl(201, 90%, 38%)';

/** Analytics UI rule: at/above nominal cell V → Online; below → Low battery (offline handled separately). */
const ANALYTICS_ONLINE_MIN_V = LIFePO4_CELL_NOMINAL_V;

function analyticsPowerBadge(node: SensorNode): { label: string; tone: 'online' | 'low' | 'offline' } {
    if (node.node_status === 'offline' || node.battery_voltage <= 0) {
        return { label: 'Offline', tone: 'offline' };
    }
    if (node.battery_voltage >= ANALYTICS_ONLINE_MIN_V) {
        return { label: 'Online', tone: 'online' };
    }
    return { label: 'Low battery', tone: 'low' };
}

function powerBadgeClass(tone: 'online' | 'low' | 'offline'): string {
    if (tone === 'offline') return 'bg-slate-100 text-slate-600 border-slate-200';
    if (tone === 'low') return 'bg-amber-50 text-amber-900 border-amber-200';
    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
}

/**
 * JSN-SR04T reports clearance (distance down to water). Chart spans 0..max(depth, floors) so warn/crit lines sit below nominal flood pools.
 */
function chartMaxCmClearance(node: Pick<SensorNode, 'water_level_cm' | 'warningThreshold' | 'criticalThreshold'>): number {
    const peak = Math.max(node.water_level_cm, node.warningThreshold, node.criticalThreshold);
    return Math.max(320, Math.ceil(peak * 1.15));
}

/** Canonical clearance floors for audit when legacy rows inverted warn/crit vs depth. */
function resolvedWaterFloors(node: SensorNode): { warn: number; crit: number } {
    if (node.type !== 'water_level') {
        return { warn: node.warningThreshold, crit: node.criticalThreshold };
    }
    let warn = node.warningThreshold;
    let crit = node.criticalThreshold;
    if (warn <= crit) {
        const t = warn;
        warn = crit;
        crit = t;
    }
    if (node.node_status !== 'offline' && node.water_level_cm > 0) {
        if (warn >= node.water_level_cm || crit >= node.water_level_cm) {
            return { warn: 150, crit: 80 };
        }
    }
    return { warn, crit };
}

function sortByAt(points: ReadingPoint[]): ReadingPoint[] {
    return [...points].sort((a, b) => a.at - b.at);
}

export default function Analytics() {
    const { nodes, readingHistories, isFetching, isLoading } = useSensorNetwork();

    const focusNode = useMemo(() => {
        if (nodes.length === 0) return null;
        return (
            nodes.find((n) => n.publicCode === 'SN-004') ??
            nodes.find((n) => n.name.toLowerCase().includes('alau')) ??
            nodes.find((n) => n.type === 'water_level') ??
            nodes[0]
        );
    }, [nodes]);

    const waterNodes = useMemo(
        () => nodes.filter((n) => n.type === 'water_level' && n.node_status !== 'offline'),
        [nodes],
    );

    const focusHistory = useMemo(() => {
        if (!focusNode) return [];
        const raw = readingHistories[focusNode.id] ?? [];
        return sortByAt(raw);
    }, [focusNode, readingHistories]);
    const focusFloors = focusNode ? resolvedWaterFloors(focusNode) : { warn: 150, crit: 80 };
    const focusWl = focusNode
        ? getWaterLevelSeverity(
              focusNode,
              focusNode.type === 'water_level'
                  ? { warning: focusFloors.warn, critical: focusFloors.crit }
                  : undefined,
          )
        : 'n/a';
    const focusPower = focusNode ? analyticsPowerBadge(focusNode) : { label: 'Offline', tone: 'offline' as const };

    const focusServerLen = focusNode ? (readingHistories[focusNode.id]?.length ?? 0) : 0;
    const serverRegionalKey = useMemo(
        () => waterNodes.map((n) => `${n.id}:${readingHistories[n.id]?.length ?? 0}`).join('|'),
        [waterNodes, readingHistories],
    );

    const [liveFocus, setLiveFocus] = useState<ReadingPoint[]>([]);
    const [liveRegional, setLiveRegional] = useState<Record<string, ReadingPoint[]>>({});

    useEffect(() => {
        if (!focusNode || nodes.length === 0) return;
        const sorted = sortByAt(readingHistories[focusNode.id] ?? []);
        if (sorted.length > 0) setLiveFocus(sorted.slice(-96));
        else setLiveFocus(syntheticWaterHistory(focusNode.water_level_cm, 32));
    }, [focusNode, focusNode?.id, focusServerLen, nodes.length, readingHistories]);

    useEffect(() => {
        if (nodes.length === 0) return;
        setLiveRegional(() => {
            const next: Record<string, ReadingPoint[]> = {};
            for (const n of waterNodes) {
                const sorted = sortByAt(readingHistories[n.id] ?? []);
                next[n.id] = sorted.length > 0 ? sorted.slice(-28) : syntheticWaterHistory(n.water_level_cm, 22);
            }
            return next;
        });
    }, [nodes.length, serverRegionalKey, waterNodes, readingHistories]);

    useEffect(() => {
        if (nodes.length === 0 || !focusNode) return;
        const id = window.setInterval(() => {
            setLiveFocus((prev) => {
                if (prev.length < 2) return prev;
                const last = prev[prev.length - 1]!;
                return appendReadingPoint(prev, nextWaterClearanceCm(last.value), 96);
            });
        }, TELEMETRY_CHART_TICK_MS);
        return () => window.clearInterval(id);
    }, [focusNode, nodes.length]);

    useEffect(() => {
        if (nodes.length === 0) return;
        const id = window.setInterval(() => {
            setLiveRegional((reg) => {
                const next = { ...reg };
                for (const nid of Object.keys(next)) {
                    const arr = next[nid];
                    if (!arr || arr.length < 2) continue;
                    const last = arr[arr.length - 1]!;
                    next[nid] = appendReadingPoint(arr, nextWaterClearanceCm(last.value), 28);
                }
                return next;
            });
        }, TELEMETRY_CHART_TICK_MS);
        return () => window.clearInterval(id);
    }, [nodes.length]);

    const chartData = liveFocus.length > 0 ? liveFocus : focusHistory;

    const chartMaxCm = (n: NonNullable<typeof focusNode>) => chartMaxCmClearance(n);

    if (isLoading) {
        return (
            <DashboardLayout>
                <DataRefetchBar active={isFetching && !isLoading} />
                <div className="dashboard-overview-root mx-auto max-w-[1920px]">
                    <div className="dashboard-page-body">
                        <PageHeader variant="compact" icon={BarChart3} title="Water level analytics" />
                        <div className="panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
                            <AnalyticsPageSkeleton />
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (nodes.length === 0 || !focusNode) {
        return (
            <DashboardLayout>
                <div className="dashboard-overview-root mx-auto flex max-w-[1920px] flex-1 items-center justify-center px-3 py-12 sm:px-5 md:px-6">
                    <p className="text-center text-sm text-muted-foreground">
                        No sensor nodes configured or Supabase is not connected.
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <DataRefetchBar active={isFetching && !isLoading} />
            <div className="dashboard-overview-root mx-auto max-w-[1920px]">
                <div className="dashboard-page-body">
                    <PageHeader variant="compact" icon={BarChart3} title="Water level analytics" />

                    <LiveIndicator className="shrink-0" pulsing>
                        {waterNodes.length} ultrasonic channel{waterNodes.length === 1 ? '' : 's'} active
                        {isFetching ? ' · refreshing' : ''}
                    </LiveIndicator>

                    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden max-md:min-h-min max-md:overflow-visible">
                <div className="surface-card flex min-h-[min(16rem,44svh)] min-h-0 flex-[2] flex-col overflow-hidden md:min-h-0">
                    <div className="shrink-0 border-b border-border/50 p-4 sm:p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0 space-y-2">
                                <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
                                    <TrendingUp className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} />
                                    {focusNode.name}
                                    <span
                                        className={cn(
                                            'ml-0 rounded-md px-2 py-0.5 text-xs font-medium',
                                            focusWl === 'critical' && 'bg-destructive/10 text-destructive',
                                            focusWl === 'warning' && 'bg-amber-500/10 text-amber-800',
                                            focusWl === 'normal' && 'bg-emerald-500/10 text-emerald-800',
                                            focusWl === 'n/a' && 'bg-muted text-muted-foreground',
                                        )}
                                    >
                                        {focusNode.water_level_cm.toFixed(2)} cm clearance
                                    </span>
                                    <span
                                        className={cn(
                                            'rounded-md border px-2 py-0.5 text-xs font-medium',
                                            powerBadgeClass(focusPower.tone),
                                        )}
                                    >
                                        {focusPower.label} · {focusNode.battery_voltage.toFixed(2)} V
                                    </span>
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    {focusNode.location} · {formatAssetTag(focusNode.publicCode ?? focusNode.id)} · JSN-SR04T
                                    faces downward; flood reduces clearance (smaller cm).
                                </p>
                            </div>
                            <div className="text-right">
                                <p
                                    className={cn(
                                        'text-4xl font-semibold tabular-nums tracking-tight',
                                        focusWl === 'critical' && 'text-destructive',
                                        focusWl === 'warning' && 'text-amber-600',
                                        focusWl === 'normal' && 'text-foreground',
                                    )}
                                >
                                    {focusNode.water_level_cm.toFixed(2)}
                                    <span className="ml-1 text-lg font-medium text-muted-foreground">cm</span>
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">Water surface clearance</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col p-4 pt-0 sm:p-5 sm:pt-0">
                        <div className="mt-2 min-h-[12rem] min-h-0 w-full flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_PRIMARY} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={CHART_PRIMARY} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="at"
                                        type="number"
                                        domain={['dataMin', 'dataMax']}
                                        scale="time"
                                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 400 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(ts: number) =>
                                            new Date(ts).toLocaleTimeString(undefined, {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })
                                        }
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 400 }}
                                        domain={[0, chartMaxCm(focusNode)]}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => `${v}`}
                                        label={{
                                            value: 'cm',
                                            angle: -90,
                                            position: 'insideLeft',
                                            style: { fontSize: 11, fill: '#94a3b8', fontWeight: 500 },
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 8,
                                            fontSize: 13,
                                            fontWeight: 400,
                                            boxShadow:
                                                '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                        }}
                                        labelFormatter={(ts) =>
                                            typeof ts === 'number' && !Number.isNaN(ts)
                                                ? new Date(ts).toLocaleString(undefined, {
                                                      month: 'short',
                                                      day: 'numeric',
                                                      hour: '2-digit',
                                                      minute: '2-digit',
                                                      second: '2-digit',
                                                  })
                                                : String(ts)
                                        }
                                        formatter={(val: number) => [`${val.toFixed(2)} cm`, 'Clearance']}
                                    />
                                    <ReferenceLine
                                        y={focusFloors.warn}
                                        stroke="#f59e0b"
                                        strokeDasharray="4 4"
                                        strokeWidth={2}
                                        label={{
                                            value: `Warn floor (${focusFloors.warn} cm)`,
                                            position: 'insideBottomRight',
                                            fill: '#f59e0b',
                                            fontSize: 11,
                                            fontWeight: 600,
                                        }}
                                    />
                                    <ReferenceLine
                                        y={focusFloors.crit}
                                        stroke="#e11d48"
                                        strokeDasharray="4 4"
                                        strokeWidth={2}
                                        label={{
                                            value: `Crit floor (${focusFloors.crit} cm)`,
                                            position: 'insideTopRight',
                                            fill: '#e11d48',
                                            fontSize: 11,
                                            fontWeight: 600,
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={CHART_PRIMARY}
                                        strokeWidth={2}
                                        fill="url(#waterGradient)"
                                        dot={false}
                                        isAnimationActive
                                        animationDuration={880}
                                        animationEasing="ease-out"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="mt-2 shrink-0 text-center text-[0.7rem] leading-snug text-muted-foreground sm:text-xs">
                            Threshold lines are minimum safe clearance: readings at or below warn/crit floors require
                            escalation (nominal pool depth stays above these values).
                        </p>
                    </div>
                </div>

                <div className="flex min-h-[min(12rem,36svh)] min-h-0 flex-1 flex-col overflow-hidden md:min-h-0">
                    <h2 className="flex shrink-0 items-center gap-2 text-base font-semibold tracking-tight text-foreground">
                        <Droplets className="h-5 w-5 text-primary" strokeWidth={1.75} />
                        Regional sensors
                    </h2>
                    <div className="panel-scroll mt-3 min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-1">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {waterNodes.map((node) => {
                            const history = readingHistories[node.id] ?? [];
                            const lastPoints = sortByAt(history).slice(-24);
                            const displayPoints =
                                liveRegional[node.id] && liveRegional[node.id]!.length > 0
                                    ? liveRegional[node.id]!
                                    : lastPoints;
                            const floors = resolvedWaterFloors(node);
                            const wl = getWaterLevelSeverity(node, {
                                warning: floors.warn,
                                critical: floors.crit,
                            });
                            const yMax = chartMaxCm(node);
                            const power = analyticsPowerBadge(node);

                            return (
                                <div
                                    key={node.id}
                                    className={cn(
                                        'dashboard-card p-5 transition-shadow hover:shadow-sm',
                                        wl === 'critical' && 'border-destructive/35',
                                        wl === 'warning' && 'border-amber-200/90',
                                    )}
                                >
                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold tracking-tight text-foreground">{node.name}</p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {formatAssetTag(node.publicCode ?? node.id)} ·{' '}
                                                <span className={cn('font-medium', power.tone === 'online' && 'text-emerald-700', power.tone === 'low' && 'text-amber-800', power.tone === 'offline' && 'text-slate-600')}>
                                                    {power.label}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className={cn(
                                                    'text-2xl font-semibold tabular-nums tracking-tight',
                                                    wl === 'critical' && 'text-destructive',
                                                    wl === 'warning' && 'text-amber-600',
                                                    wl === 'normal' && 'text-foreground',
                                                )}
                                            >
                                                {node.water_level_cm.toFixed(2)}
                                                <span className="ml-0.5 text-xs font-medium text-muted-foreground">cm</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground">{node.battery_voltage.toFixed(2)} V</p>
                                        </div>
                                    </div>

                                    <div className="h-28 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={displayPoints}>
                                                <YAxis domain={[0, yMax]} hide />
                                                <ReferenceLine
                                                    y={floors.warn}
                                                    stroke="#f59e0b"
                                                    strokeDasharray="4 2"
                                                    strokeWidth={1}
                                                />
                                                <ReferenceLine
                                                    y={floors.crit}
                                                    stroke="#e11d48"
                                                    strokeDasharray="4 2"
                                                    strokeWidth={1}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke={
                                                        wl === 'critical'
                                                            ? '#e11d48'
                                                            : wl === 'warning'
                                                              ? '#f59e0b'
                                                              : CHART_PRIMARY
                                                    }
                                                    strokeWidth={2}
                                                    dot={false}
                                                    isAnimationActive
                                                    animationDuration={820}
                                                    animationEasing="ease-out"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="mt-3 flex flex-col gap-1 border-t border-border/50 pt-3 text-xs text-muted-foreground">
                                        <div className="flex items-center justify-between">
                                            <span>Warn floor: {floors.warn} cm</span>
                                            <span>Crit floor: {floors.crit} cm</span>
                                        </div>
                                        <span className="text-[0.65rem] leading-snug sm:text-[0.7rem]">
                                            Floors &lt; nominal depth · LiFePO₄: ≥{ANALYTICS_ONLINE_MIN_V.toFixed(2)} V → Online
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    </div>
                </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
