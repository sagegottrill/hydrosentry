import { useEffect, useState } from 'react';
import { Building2, ShieldCheck, ShieldOff, UserCheck, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type QueueRow = {
    id: string;
    redactedName: string;
    clearanceId: string;
    agency: string;
    status: 'pending' | 'cleared';
};

const SEED_QUEUE: QueueRow[] = [
    { id: '1', redactedName: 'A**** M*******', clearanceId: 'CLR-2026-88421', agency: 'Ministry of Health', status: 'pending' },
    { id: '2', redactedName: 'F**** I****', clearanceId: 'CLR-2026-88422', agency: 'State Field Ops', status: 'pending' },
    { id: '3', redactedName: 'U**** B*******', clearanceId: 'CLR-2026-88419', agency: 'UN OCHA Liaison', status: 'cleared' },
];

function sleep(ms: number) {
    return new Promise<void>((r) => window.setTimeout(r, ms));
}

/**
 * Admin Core — B2G clearance console (prototype). High-volume ingestion optics + PII redaction + RBAC gating.
 */
export default function AdminCore() {
    const [isSystemAdmin, setIsSystemAdmin] = useState(false);
    const [rows, setRows] = useState<QueueRow[]>(SEED_QUEUE);
    const [clearedExtra, setClearedExtra] = useState(0);
    const [selectedId, setSelectedId] = useState<string>(SEED_QUEUE[0]!.id);
    const [busyAction, setBusyAction] = useState<string | null>(null);

    const pendingCount = rows.filter((r) => r.status === 'pending').length;
    const pendingDisplay = 140 + pendingCount;
    const clearedDisplay = 5241 + clearedExtra;

    const selected = rows.find((r) => r.id === selectedId) ?? rows[0]!;

    useEffect(() => {
        if (rows.length === 0) return;
        if (!rows.some((r) => r.id === selectedId)) {
            setSelectedId(rows[0]!.id);
        }
    }, [rows, selectedId]);

    const runAction = async (rowId: string, action: 'approve' | 'reject') => {
        const key = `${action}-${rowId}`;
        if (busyAction) return;
        if (!isSystemAdmin) {
            toast.warning('Action blocked', {
                description: 'System administrator privileges required. RBAC Audit Logged.',
            });
            return;
        }
        setBusyAction(key);
        await sleep(500);
        setBusyAction(null);
        if (action === 'approve') {
            setClearedExtra((n) => n + 1);
            setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, status: 'cleared' as const } : r)));
            toast.success('System Action Logged', { description: 'Clearance granted — RBAC audit retained.' });
        } else {
            setRows((prev) => prev.filter((r) => r.id !== rowId));
            toast.success('System Action Logged', { description: 'Record rejected — RBAC audit retained.' });
        }
    };

    return (
        <DashboardLayout>
            <div className="dashboard-overview-root mx-auto max-w-[1920px]">
                <div className="dashboard-page-body">
                    <PageHeader
                        variant="compact"
                        icon={Building2}
                        title="Admin Core — B2G clearance"
                        description="High-volume identity and access reviews with cryptographic redaction of personally identifiable information."
                    />

                    <div className="flex shrink-0 flex-col gap-4 rounded-lg border border-border bg-muted/15 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            {isSystemAdmin ? (
                                <ShieldCheck className="h-8 w-8 shrink-0 text-emerald-600" strokeWidth={1.5} />
                            ) : (
                                <ShieldOff className="h-8 w-8 shrink-0 text-amber-600" strokeWidth={1.5} />
                            )}
                            <div>
                                <Label htmlFor="admin-session" className="text-sm font-semibold text-foreground">
                                    System administrator session
                                </Label>
                                <p className="text-xs text-muted-foreground">Required to approve or reject clearance records.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch id="admin-session" checked={isSystemAdmin} onCheckedChange={setIsSystemAdmin} />
                            <span className="text-xs font-medium text-muted-foreground">{isSystemAdmin ? 'Elevated' : 'Read-only'}</span>
                        </div>
                    </div>

                    <div className="stat-grid stat-grid-5 shrink-0">
                        {[
                            { label: 'Cleared (rolling 24h)', value: clearedDisplay.toLocaleString(), icon: UserCheck, col: 'text-emerald-700', ico: 'text-emerald-500' },
                            { label: 'Pending review', value: pendingDisplay.toLocaleString(), icon: Building2, col: 'text-amber-700', ico: 'text-amber-500' },
                            { label: 'Ingestion throughput', value: '18.4k / hr', icon: Building2, col: 'text-foreground', ico: 'text-primary' },
                            { label: 'Escalations', value: '33', icon: ShieldOff, col: 'text-rose-600', ico: 'text-rose-500' },
                            { label: 'Stack version', value: 'v1.2.4-MVP', icon: ShieldCheck, col: 'text-primary', ico: 'text-primary' },
                        ].map((s, i) => (
                            <div key={i} className="stat-tile">
                                <div className="stat-tile-head">
                                    <s.icon className={cn('h-4 w-4 shrink-0', s.ico)} strokeWidth={1.75} />
                                    <p className="stat-tile-label">{s.label}</p>
                                </div>
                                <p className={cn('stat-tile-value', s.col)}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid min-h-0 flex-1 gap-4 overflow-hidden max-md:min-h-min max-md:overflow-visible lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
                        <div className="dashboard-card flex min-h-0 min-w-0 flex-col overflow-hidden p-0">
                            <div className="shrink-0 border-b border-border bg-muted/20 px-4 py-3">
                                <h2 className="text-sm font-semibold text-foreground">Clearance queue (PII redacted)</h2>
                                <p className="text-xs text-muted-foreground">Select a row to open the resolution desk.</p>
                            </div>
                            <div className="panel-scroll min-h-0 flex-1 divide-y divide-border overflow-y-auto overscroll-y-contain">
                                {rows.map((row) => {
                                    const active = row.id === selectedId;
                                    return (
                                        <button
                                            key={row.id}
                                            type="button"
                                            onClick={() => setSelectedId(row.id)}
                                            className={cn(
                                                'flex w-full flex-col gap-1 p-4 text-left transition-colors hover:bg-muted/30',
                                                active && 'bg-primary/[0.06] ring-2 ring-inset ring-primary',
                                            )}
                                        >
                                            <p className="font-mono text-sm font-semibold text-foreground">{row.redactedName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {row.clearanceId} · {row.agency}
                                            </p>
                                            <p className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">
                                                {row.status === 'cleared' ? 'Cleared' : 'Awaiting decision'}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="dashboard-card panel-scroll flex min-h-0 min-w-0 flex-col overflow-y-auto overscroll-y-contain p-5 sm:p-6">
                        <h2 className="text-base font-semibold text-foreground">Resolution desk</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Review cryptographic masking and agency context before releasing credentials.
                        </p>
                        <dl className="mt-5 space-y-3 text-sm">
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Subject (redacted)</dt>
                                <dd className="font-mono font-semibold text-foreground">{selected.redactedName}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Clearance ID</dt>
                                <dd className="text-foreground">{selected.clearanceId}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sponsoring agency</dt>
                                <dd className="text-foreground">{selected.agency}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pipeline state</dt>
                                <dd className="font-medium text-foreground">
                                    {selected.status === 'cleared' ? 'Released to downstream IAM' : 'Held for human attestation'}
                                </dd>
                            </div>
                        </dl>

                        {selected.status === 'pending' ? (
                            <div className="mt-6 flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    className="bg-emerald-600 text-white hover:bg-emerald-600/90"
                                    disabled={busyAction != null}
                                    onClick={() => void runAction(selected.id, 'approve')}
                                >
                                    {busyAction === `approve-${selected.id}` ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Approve clearance
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={busyAction != null}
                                    onClick={() => void runAction(selected.id, 'reject')}
                                >
                                    {busyAction === `reject-${selected.id}` ? (
                                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <XCircle className="mr-1 h-3.5 w-3.5" />
                                    )}
                                    Reject record
                                </Button>
                            </div>
                        ) : (
                            <p className="mt-6 text-sm font-medium text-emerald-700">Released — no further action on this clearance.</p>
                        )}
                        </div>
                    </div>

                    <p className="shrink-0 text-center text-[0.6875rem] text-muted-foreground">
                        Admin Core v1.2.4-MVP · MIT Open-Source License · Orivon Edge
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
