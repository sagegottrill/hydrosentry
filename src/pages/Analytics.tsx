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
import { useSensorNetwork } from '@/hooks/useSensorNetwork';
import { cn } from '@/lib/utils';
import { getWaterLevelSeverity } from '@/lib/sensorTelemetry';

const CHART_PRIMARY = 'hsl(201, 90%, 38%)';

export default function Analytics() {
    const { nodes, readingHistories, isFetching } = useSensorNetwork();

    if (nodes.length === 0) {
        return (
            <DashboardLayout>
                <div className="dashboard-shell py-20 text-center">
                    <p className="text-sm text-muted-foreground">No sensor nodes configured or Supabase is not connected.</p>
                </div>
            </DashboardLayout>
        );
    }

    const focusNode =
        nodes.find((n) => n.publicCode === 'SN-004') ??
        nodes.find((n) => n.name.toLowerCase().includes('alau')) ??
        nodes.find((n) => n.type === 'water_level') ??
        nodes[0];
    const focusHistory = focusNode ? readingHistories[focusNode.id] ?? [] : [];
    const focusWl = focusNode ? getWaterLevelSeverity(focusNode) : 'n/a';

    const waterNodes = nodes.filter((n) => n.type === 'water_level' && n.node_status !== 'offline');

    const chartMaxCm = (n: typeof focusNode) =>
        Math.max(500, n.criticalThreshold * 1.25, n.water_level_cm * 1.1);

    return (
        <DashboardLayout>
            <div className="dashboard-shell">
                <PageHeader variant="compact" icon={BarChart3} title="Water level analytics" />

                <LiveIndicator pulsing={isFetching}>
                    {waterNodes.length} ultrasonic channel{waterNodes.length === 1 ? '' : 's'} active
                    {isFetching ? ' · refreshing' : ''}
                </LiveIndicator>

                <div className="surface-card overflow-hidden">
                    <div className="border-b border-border/50 p-4 sm:p-5">
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
                                        {focusNode.water_level_cm.toFixed(1)} cm · {focusNode.node_status.replace('_', ' ')}
                                    </span>
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    {focusNode.location} · {focusNode.publicCode ?? focusNode.id} ·{' '}
                                    {focusNode.battery_voltage.toFixed(2)} V cell
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
                                    {focusNode.water_level_cm.toFixed(1)}
                                    <span className="ml-1 text-lg font-medium text-muted-foreground">cm</span>
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">JSN-SR04T depth</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 pt-0 sm:p-5 sm:pt-0">
                        <div className="mt-2 h-72 w-full sm:h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={focusHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_PRIMARY} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={CHART_PRIMARY} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 400 }}
                                        axisLine={false}
                                        tickLine={false}
                                        interval={Math.max(Math.floor(focusHistory.length / 12), 1)}
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
                                        formatter={(val: number) => [`${val.toFixed(1)} cm`, 'Water depth']}
                                    />
                                    <ReferenceLine
                                        y={focusNode.warningThreshold}
                                        stroke="#f59e0b"
                                        strokeDasharray="4 4"
                                        strokeWidth={2}
                                        label={{
                                            value: `WARN (${focusNode.warningThreshold} cm)`,
                                            position: 'insideBottomRight',
                                            fill: '#f59e0b',
                                            fontSize: 11,
                                            fontWeight: 600,
                                        }}
                                    />
                                    <ReferenceLine
                                        y={focusNode.criticalThreshold}
                                        stroke="#e11d48"
                                        strokeDasharray="4 4"
                                        strokeWidth={2}
                                        label={{
                                            value: `CRIT (${focusNode.criticalThreshold} cm)`,
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
                                        isAnimationActive={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
                        <Droplets className="h-5 w-5 text-primary" strokeWidth={1.75} />
                        Regional sensors
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {waterNodes.map((node) => {
                            const history = readingHistories[node.id] ?? [];
                            const lastPoints = history.slice(-24);
                            const wl = getWaterLevelSeverity(node);
                            const yMax = chartMaxCm(node);

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
                                                {node.publicCode ?? node.id} · {node.node_status.replace('_', ' ')}
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
                                                {node.water_level_cm.toFixed(1)}
                                                <span className="ml-0.5 text-xs font-medium text-muted-foreground">cm</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground">{node.battery_voltage.toFixed(2)} V</p>
                                        </div>
                                    </div>

                                    <div className="h-28 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={lastPoints}>
                                                <YAxis domain={[0, yMax]} hide />
                                                <ReferenceLine
                                                    y={node.warningThreshold}
                                                    stroke="#f59e0b"
                                                    strokeDasharray="4 2"
                                                    strokeWidth={1}
                                                />
                                                <ReferenceLine
                                                    y={node.criticalThreshold}
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
                                                    isAnimationActive={false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
                                        <span>Warn: {node.warningThreshold} cm</span>
                                        <span>Crit: {node.criticalThreshold} cm</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
