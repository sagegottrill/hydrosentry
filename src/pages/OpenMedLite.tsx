import { useEffect, useMemo, useRef, useState } from 'react';
import { HeartPulse, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Conflict = {
    id: string;
    patient: string;
    clinician: string;
    fieldLabel: string;
    localValue: string;
    masterValue: string;
    localNote: string;
    masterNote: string;
};

const QUEUE: Conflict[] = [
    {
        id: 'om-001',
        patient: 'Fatima Ibrahim',
        clinician: 'Dr. Abubakar Yaro — Primary Health Centre, Dikwa',
        fieldLabel: 'Penicillin allergy (critical safety flag)',
        localValue: 'YES',
        masterValue: 'NO',
        localNote: 'Captured during triage — Amina (nurse) attested.',
        masterNote: 'Last sync from referral hospital — discrepancy detected.',
    },
    {
        id: 'om-002',
        patient: 'Usman Bello',
        clinician: 'Dr. Chioma Okonkwo — University of Maiduguri Teaching Hospital',
        fieldLabel: 'HbA1c reference (diabetes monitoring)',
        localValue: '7.8%',
        masterValue: '6.1%',
        localNote: 'Point-of-care meter at mobile clinic — same-day draw.',
        masterNote: 'Lab fasting panel from state referral — 48h older.',
    },
    {
        id: 'om-003',
        patient: 'Amina Yusuf',
        clinician: 'Dr. Halima Garba — Gwoza PHC',
        fieldLabel: 'Tetanus immunization date',
        localValue: '12 Mar 2026',
        masterValue: 'Not recorded',
        localNote: 'Card photo verified by ward clerk.',
        masterNote: 'Master EHR missing last-mile vaccination event.',
    },
];

function sleep(ms: number) {
    return new Promise<void>((r) => window.setTimeout(r, ms));
}

/**
 * OpenMed Lite — CRDT Conflict Resolution Desk (prototype).
 * Seeded human-in-the-loop clinical conflicts for fellowship review.
 */
export default function OpenMedLite() {
    const [selectedId, setSelectedId] = useState(QUEUE[0]!.id);
    const [mergedIds, setMergedIds] = useState<Set<string>>(() => new Set());
    const [phaseById, setPhaseById] = useState<Record<string, 'idle' | 'loading' | 'sealing' | 'merged'>>(() =>
        Object.fromEntries(QUEUE.map((c) => [c.id, 'idle'])),
    );
    const mergeInFlightRef = useRef(false);

    const openQueue = useMemo(() => QUEUE.filter((c) => !mergedIds.has(c.id)), [mergedIds]);

    useEffect(() => {
        if (openQueue.length === 0) return;
        if (!openQueue.some((c) => c.id === selectedId)) {
            setSelectedId(openQueue[0]!.id);
        }
    }, [openQueue, selectedId]);

    const selected = useMemo(
        () => QUEUE.find((c) => c.id === selectedId) ?? openQueue[0] ?? null,
        [selectedId, openQueue],
    );

    const phase = selected ? phaseById[selected.id] ?? 'idle' : 'idle';

    const onApproveMerge = async () => {
        if (!selected || phase !== 'idle' || mergeInFlightRef.current) return;
        mergeInFlightRef.current = true;
        const id = selected.id;
        try {
            setPhaseById((p) => ({ ...p, [id]: 'loading' }));
            await sleep(500);
            setPhaseById((p) => ({ ...p, [id]: 'sealing' }));
            await sleep(800);
            setMergedIds((prev) => new Set(prev).add(id));
            setPhaseById((p) => ({ ...p, [id]: 'merged' }));
            toast.success('System Action Logged', {
                description: 'Approve & merge — local replica sealed; RBAC audit retained.',
            });
        } finally {
            mergeInFlightRef.current = false;
        }
    };

    return (
        <DashboardLayout>
            <div className="dashboard-overview-root mx-auto max-w-[1920px]">
                <div className="dashboard-page-body">
                    <PageHeader
                        variant="compact"
                        icon={HeartPulse}
                        title="OpenMed Lite — CRDT conflict resolution desk"
                        description="Human-in-the-loop reconciliation when edge registers disagree with the master clinical record."
                    />

                    <div className="grid min-h-0 flex-1 gap-4 overflow-hidden max-md:min-h-min max-md:overflow-visible lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
                        <div className="dashboard-card flex min-h-0 min-w-0 flex-col overflow-hidden p-0">
                            <div className="shrink-0 border-b border-border bg-muted/20 px-4 py-3">
                                <h2 className="text-sm font-semibold text-foreground">Conflict queue</h2>
                                <p className="text-xs text-muted-foreground">{openQueue.length} open · {mergedIds.size} sealed</p>
                            </div>
                            <ul className="panel-scroll min-h-0 flex-1 divide-y divide-border overflow-y-auto overscroll-y-contain">
                            {QUEUE.map((c) => {
                                const done = mergedIds.has(c.id);
                                const active = c.id === selected?.id;
                                return (
                                    <li key={c.id}>
                                        <button
                                            type="button"
                                            disabled={done}
                                            onClick={() => setSelectedId(c.id)}
                                            className={cn(
                                                'flex w-full flex-col gap-0.5 px-4 py-3 text-left text-sm transition-colors',
                                                !done && 'hover:bg-muted/40',
                                                done && 'cursor-default opacity-60',
                                                active &&
                                                    !done &&
                                                    'bg-primary/[0.06] ring-2 ring-inset ring-primary shadow-sm',
                                            )}
                                        >
                                            <span className="font-semibold text-foreground">{c.patient}</span>
                                            <span className="line-clamp-2 text-xs text-muted-foreground">{c.fieldLabel}</span>
                                            {done ? (
                                                <span className="text-2xs font-medium uppercase tracking-wide text-emerald-700">
                                                    Merged
                                                </span>
                                            ) : (
                                                <span className="text-2xs font-medium uppercase tracking-wide text-amber-800">
                                                    Pending
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                            </ul>
                        </div>

                    <div className="min-h-0 min-w-0 overflow-hidden lg:min-h-0">
                    {selected ? (
                        <div className="panel-scroll grid max-h-none min-h-0 gap-4 overflow-y-auto overscroll-y-contain lg:max-h-full lg:grid-cols-2">
                            <div className="dashboard-card border-amber-200/80 p-5 sm:p-6">
                                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-amber-900">
                                    <ShieldAlert className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                                    Active conflict
                                </div>
                                <dl className="space-y-3 text-sm">
                                    <div>
                                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Patient</dt>
                                        <dd className="font-semibold text-foreground">{selected.patient}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Treating clinician
                                        </dt>
                                        <dd className="text-foreground">{selected.clinician}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Field</dt>
                                        <dd className="font-semibold text-rose-700">{selected.fieldLabel}</dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="dashboard-card p-5 sm:p-6">
                                <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Side-by-side replicas
                                </p>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg border border-border bg-muted/20 p-4">
                                        <p className="text-2xs font-bold uppercase tracking-wide text-primary">Local ward register</p>
                                        <p className="mt-2 text-2xl font-bold text-destructive">{selected.localValue}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{selected.localNote}</p>
                                    </div>
                                    <div className="rounded-lg border border-border bg-muted/20 p-4">
                                        <p className="text-2xs font-bold uppercase tracking-wide text-slate-600">Master EHR (state)</p>
                                        <p className="mt-2 text-2xl font-bold text-emerald-700">{selected.masterValue}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{selected.masterNote}</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                                    {mergedIds.has(selected.id) ? (
                                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-900">
                                            <CheckCircle2 className="h-5 w-5 shrink-0" />
                                            Merge sealed — local policy applied; audit trail retained.
                                        </div>
                                    ) : (
                                        <Button
                                            type="button"
                                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                                            disabled={phase === 'loading' || phase === 'sealing'}
                                            onClick={() => void onApproveMerge()}
                                        >
                                            {phase === 'loading' || phase === 'sealing' ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    {phase === 'loading' ? 'Queuing action…' : 'Cryptographically sealing…'}
                                                </>
                                            ) : (
                                                'Approve & merge'
                                            )}
                                        </Button>
                                    )}
                                </div>
                                {phase === 'sealing' ? (
                                    <p className="mt-3 text-xs text-muted-foreground">
                                        Applying tamper-evident write to the ward&apos;s offline-first ledger before uplink.
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    ) : (
                        <div className="dashboard-card flex min-h-[12rem] flex-1 items-center justify-center text-sm text-muted-foreground">
                            Queue cleared — all conflicts sealed for this session.
                        </div>
                    )}
                    </div>
                </div>

                    <p className="shrink-0 text-center text-[0.6875rem] text-muted-foreground">
                        OpenMed Lite v1.2.4-MVP · MIT Open-Source License · Orivon Edge
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
