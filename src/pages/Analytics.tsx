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
            <div className="min-h-screen bg-secondary/30 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <BarChart3 className="h-7 w-7 text-primary" />
                            Water Level Analytics
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Real-time hydrological data and threshold monitoring across all sensor nodes
                        </p>
                    </div>

                    {/* Live indicator */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                        </span>
                        <span>Live — streaming data from {waterNodes.length} water-level sensors</span>
                    </div>

                    {/* Main Chart — Focus Sensor */}
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        {focusNode.name}
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'ml-2 text-xs',
                                                focusNode.status === 'critical' && 'bg-destructive/10 text-destructive border-destructive/30',
                                                focusNode.status === 'warning' && 'bg-warning/10 text-warning border-warning/30',
                                                focusNode.status === 'online' && 'bg-success/10 text-success border-success/30',
                                            )}
                                        >
                                            {focusNode.currentReading.toFixed(2)}{focusNode.readingUnit}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>{focusNode.location} — {focusNode.id}</CardDescription>
                                </div>
                                <div className="text-right">
                                    <p className={cn(
                                        'text-3xl font-bold tabular-nums',
                                        focusNode.status === 'critical' ? 'text-destructive' :
                                            focusNode.status === 'warning' ? 'text-warning' : 'text-foreground',
                                    )}>
                                        {focusNode.currentReading.toFixed(2)}
                                        <span className="text-base font-normal text-muted-foreground ml-1">{focusNode.readingUnit}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">Current Reading</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pr-2">
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={focusHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(199, 100%, 43%)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(199, 100%, 43%)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis
                                            dataKey="time"
                                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                            interval={Math.max(Math.floor(focusHistory.length / 12), 1)}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                            domain={[0, 6]}
                                            tickFormatter={v => `${v}m`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: 8,
                                                fontSize: 12,
                                            }}
                                            formatter={(val: number) => [`${val.toFixed(2)}m`, 'Water Level']}
                                        />
                                        {/* Warning threshold */}
                                        <ReferenceLine
                                            y={focusNode.warningThreshold}
                                            stroke="hsl(38, 92%, 50%)"
                                            strokeDasharray="8 4"
                                            strokeWidth={2}
                                            label={{
                                                value: `Warning (${focusNode.warningThreshold}m)`,
                                                position: 'insideTopRight',
                                                fill: 'hsl(38, 92%, 50%)',
                                                fontSize: 11,
                                            }}
                                        />
                                        {/* Critical threshold */}
                                        <ReferenceLine
                                            y={focusNode.criticalThreshold}
                                            stroke="hsl(0, 84%, 60%)"
                                            strokeDasharray="8 4"
                                            strokeWidth={2}
                                            label={{
                                                value: `Critical (${focusNode.criticalThreshold}m)`,
                                                position: 'insideTopRight',
                                                fill: 'hsl(0, 84%, 60%)',
                                                fontSize: 11,
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="hsl(199, 100%, 43%)"
                                            strokeWidth={2}
                                            fill="url(#waterGradient)"
                                            dot={false}
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Individual Sensor Charts */}
                    <div>
                        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Droplets className="h-5 w-5 text-primary" />
                            All Water Level Sensors
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {waterNodes.map(node => {
                                const history = readingHistories[node.id] ?? [];
                                const lastPoints = history.slice(-24);

                                return (
                                    <Card key={node.id} className={cn(
                                        'transition-all',
                                        (node.status === 'critical' || node.tinymlStatus === 'anomaly_detected') && 'ring-1 ring-destructive/30',
                                    )}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{node.name}</p>
                                                    <p className="text-xs text-muted-foreground">{node.id} — {node.location}</p>
                                                </div>
                                                <p className={cn(
                                                    'text-lg font-bold tabular-nums',
                                                    node.status === 'critical' ? 'text-destructive' :
                                                        node.status === 'warning' ? 'text-warning' : 'text-foreground',
                                                )}>
                                                    {node.currentReading.toFixed(2)}
                                                    <span className="text-xs font-normal text-muted-foreground ml-0.5">{node.readingUnit}</span>
                                                </p>
                                            </div>

                                            <div className="h-24">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={lastPoints}>
                                                        <ReferenceLine
                                                            y={node.warningThreshold}
                                                            stroke="hsl(38, 92%, 50%)"
                                                            strokeDasharray="4 2"
                                                            strokeWidth={1}
                                                        />
                                                        <ReferenceLine
                                                            y={node.criticalThreshold}
                                                            stroke="hsl(0, 84%, 60%)"
                                                            strokeDasharray="4 2"
                                                            strokeWidth={1}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="value"
                                                            stroke={
                                                                node.status === 'critical' ? 'hsl(0, 84%, 60%)' :
                                                                    node.status === 'warning' ? 'hsl(38, 92%, 50%)' :
                                                                        'hsl(199, 100%, 43%)'
                                                            }
                                                            strokeWidth={2}
                                                            dot={false}
                                                            isAnimationActive={false}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>

                                            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                                <span>Warn: {node.warningThreshold}{node.readingUnit}</span>
                                                <span>Crit: {node.criticalThreshold}{node.readingUnit}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
