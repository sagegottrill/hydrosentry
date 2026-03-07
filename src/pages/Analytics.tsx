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
import { BarChart3, TrendingUp, Droplets, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useSensorNetwork } from '@/hooks/useSensorNetwork';
import { cn } from '@/lib/utils';

// Re-export readable time labels for charts
function generateTimeLabels(hours: number): string[] {
    const labels: string[] = [];
    const now = Date.now();
    for (let i = hours; i >= 0; i--) {
        const t = new Date(now - i * 3600000);
        labels.push(t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    return labels;
}

export default function Analytics() {
    const { nodes, readingHistories } = useSensorNetwork();

    // Focus sensor for the main chart (Alau Dam — the one that trends up)
    const focusNode = nodes.find(n => n.id === 'SN-004') ?? nodes[0];
    const focusHistory = readingHistories['SN-004'] ?? readingHistories[nodes[0]?.id] ?? [];

    // Water-level sensors only
    const waterNodes = nodes.filter(n => n.type === 'water_level' && n.status !== 'offline');

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto py-8 px-6 space-y-6">
                {/* Header */}
                <div className="border-b border-slate-200 pb-4">
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                        <BarChart3 className="h-6 w-6 text-[#005587]" />
                        Water Level Analytics
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1.5">
                        Real-time hydrological data and threshold monitoring
                    </p>
                </div>

                {/* Live indicator */}
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#005587] bg-sky-50 border border-sky-100 py-1.5 px-3 rounded-full w-fit">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#005587] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#005587]" />
                    </span>
                    <span>Live Sync — {waterNodes.length} sensors active</span>
                </div>
                {/* Main Chart — Focus Sensor */}
                <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                    <div className="p-6 pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 tracking-tight">
                                    <TrendingUp className="h-5 w-5 text-[#005587]" />
                                    {focusNode.name}
                                    <span className={cn(
                                        'ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                                        focusNode.status === 'critical' ? 'bg-rose-50 text-rose-700' :
                                            focusNode.status === 'warning' ? 'bg-amber-50 text-amber-700' :
                                                'bg-emerald-50 text-emerald-700'
                                    )}>
                                        {focusNode.currentReading.toFixed(2)}{focusNode.readingUnit}
                                    </span>
                                </h2>
                                <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest">{focusNode.location} — {focusNode.id}</p>
                            </div>
                            <div className="text-right">
                                <p className={cn(
                                    'text-4xl font-extrabold tabular-nums tracking-tight',
                                    focusNode.status === 'critical' ? 'text-rose-600' :
                                        focusNode.status === 'warning' ? 'text-amber-600' : 'text-slate-900',
                                )}>
                                    {focusNode.currentReading.toFixed(2)}
                                    <span className="text-lg font-bold text-slate-400 ml-1">{focusNode.readingUnit}</span>
                                </p>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Current Reading</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="h-80 w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={focusHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#005587" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#005587" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                                        axisLine={false}
                                        tickLine={false}
                                        interval={Math.max(Math.floor(focusHistory.length / 12), 1)}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                                        domain={[0, 6]}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={v => `${v}m`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 8,
                                            fontSize: 12,
                                            fontWeight: 'bold',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                        }}
                                        formatter={(val: number) => [`${val.toFixed(2)}m`, 'Water Level']}
                                    />
                                    {/* Warning threshold */}
                                    <ReferenceLine
                                        y={focusNode.warningThreshold}
                                        stroke="#f59e0b"
                                        strokeDasharray="4 4"
                                        strokeWidth={2}
                                        label={{
                                            value: `WARN (${focusNode.warningThreshold}m)`,
                                            position: 'insideBottomRight',
                                            fill: '#f59e0b',
                                            fontSize: 10,
                                            fontWeight: 800
                                        }}
                                    />
                                    {/* Critical threshold */}
                                    <ReferenceLine
                                        y={focusNode.criticalThreshold}
                                        stroke="#e11d48"
                                        strokeDasharray="4 4"
                                        strokeWidth={2}
                                        label={{
                                            value: `CRIT (${focusNode.criticalThreshold}m)`,
                                            position: 'insideTopRight',
                                            fill: '#e11d48',
                                            fontSize: 10,
                                            fontWeight: 800
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#005587"
                                        strokeWidth={3}
                                        fill="url(#waterGradient)"
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div >

                {/* Individual Sensor Charts */}
                < div >
                    <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 tracking-tight">
                        <Droplets className="h-5 w-5 text-[#005587]" />
                        Regional Water Level Sensors
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {waterNodes.map(node => {
                            const history = readingHistories[node.id] ?? [];
                            const lastPoints = history.slice(-24);

                            return (
                                <div key={node.id} className={cn(
                                    'bg-white border border-slate-200 rounded-xl shadow-sm p-5 transition-all',
                                    (node.status === 'critical' || node.tinymlStatus === 'anomaly_detected') && 'border-rose-400 shadow-rose-100 shadow-md',
                                )}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 tracking-tight">{node.name}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{node.id} — {node.location}</p>
                                        </div>
                                        <p className={cn(
                                            'text-2xl font-extrabold tabular-nums tracking-tight',
                                            node.status === 'critical' ? 'text-rose-600' :
                                                node.status === 'warning' ? 'text-amber-600' : 'text-slate-900',
                                        )}>
                                            {node.currentReading.toFixed(2)}
                                            <span className="text-xs font-bold text-slate-400 ml-0.5">{node.readingUnit}</span>
                                        </p>
                                    </div>

                                    <div className="h-24 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={lastPoints}>
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
                                                        node.status === 'critical' ? '#e11d48' :
                                                            node.status === 'warning' ? '#f59e0b' :
                                                                '#005587'
                                                    }
                                                    strokeWidth={2}
                                                    dot={false}
                                                    isAnimationActive={false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="flex items-center justify-between mt-3 text-[10px] uppercase font-bold tracking-widest text-slate-400 border-t border-slate-100 pt-3">
                                        <span>Warn: {node.warningThreshold}{node.readingUnit}</span>
                                        <span>Crit: {node.criticalThreshold}{node.readingUnit}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div >
            </div >
        </DashboardLayout >
    );
}
