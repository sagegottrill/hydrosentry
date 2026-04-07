import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/** Stat tiles row — matches `.stat-grid.stat-grid-7` layouts. */
export function StatTilesRowSkeleton({ count = 7, className }: { count?: number; className?: string }) {
    return (
        <div className={cn('stat-grid stat-grid-7', className)}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="stat-tile">
                    <div className="stat-tile-head">
                        <Skeleton className="h-4 w-4 shrink-0 rounded-md" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="mt-2 h-7 w-12" />
                </div>
            ))}
        </div>
    );
}

export function StatTilesRowSkeleton5({ className }: { className?: string }) {
    return (
        <div className={cn('stat-grid stat-grid-5', className)}>
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="stat-tile">
                    <div className="stat-tile-head">
                        <Skeleton className="h-4 w-4 shrink-0 rounded-md" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="mt-2 h-8 w-16" />
                </div>
            ))}
        </div>
    );
}

export function LiveRowSkeleton() {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-4 w-48 max-w-full" />
        </div>
    );
}

function SensorListItemSkeleton() {
    return (
        <div className="w-full rounded-lg border border-border/80 bg-card p-3">
            <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-16 rounded-md" />
            </div>
            <Skeleton className="mt-2 h-4 w-[85%]" />
            <Skeleton className="mt-2 h-3 w-full" />
        </div>
    );
}

function SensorDetailPanelSkeleton() {
    return (
        <div className="dashboard-card space-y-5 p-5 sm:p-6">
            <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-3 w-64 max-w-full" />
                </div>
                <Skeleton className="h-10 w-36 shrink-0 rounded-lg" />
            </div>
            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-5 w-28 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
            </div>
            <Skeleton className="h-3 w-3/4 max-w-md" />
            <Skeleton className="h-3 w-1/2 max-w-sm" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
            </div>
            <Skeleton className="h-16 w-full rounded-lg" />
            <div className="flex justify-between border-t border-border pt-3">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
    );
}

/** Full sensor network shell: stats, live strip, master–detail columns. */
export function SensorNetworkPageSkeleton() {
    return (
        <>
            <StatTilesRowSkeleton count={7} />
            <LiveRowSkeleton />
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
                <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-card/40 p-2">
                    <Skeleton className="mx-2 mt-1 h-3 w-28" />
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SensorListItemSkeleton key={i} />
                    ))}
                </div>
                <SensorDetailPanelSkeleton />
            </div>
        </>
    );
}

/** Matches dashboard metric card footprint (`.dashboard-card` KPI cell). */
export function MetricCardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('dashboard-card flex h-full min-h-[7.5rem] flex-col overflow-hidden p-4', className)}>
            <div className="mb-3 flex items-start justify-between gap-2">
                <Skeleton className="h-3 w-[70%]" />
                <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
            </div>
            <div className="mt-auto flex flex-1 items-end justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="hidden h-11 w-20 shrink-0 rounded min-[380px]:block" />
            </div>
        </div>
    );
}

export function DashboardMapAndDispatchSkeleton() {
    return (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_min(18rem,100%)] xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="surface-card flex min-h-[min(52svh,22rem)] min-w-0 flex-col overflow-hidden p-3 sm:min-h-[16rem] sm:p-4 md:min-h-0 md:flex-1">
                <div className="mb-3 flex shrink-0 justify-between gap-2">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-9 w-32 rounded-md" />
                </div>
                <Skeleton className="min-h-0 flex-1 rounded-md" />
            </div>
            <div className="dashboard-card flex min-h-[14rem] min-w-0 flex-col overflow-hidden">
                <div className="shrink-0 border-b border-border/40 bg-muted/15 px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    <Skeleton className="mt-2 h-3 w-40" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="dashboard-card space-y-3 p-4">
                            <div className="flex justify-between gap-2">
                                <Skeleton className="h-5 w-24 rounded-md" />
                                <Skeleton className="h-3 w-12" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-4/5" />
                            <Skeleton className="h-10 w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function AnalyticsPageSkeleton() {
    return (
        <>
            <LiveRowSkeleton />
            <div className="surface-card overflow-hidden">
                <div className="space-y-3 border-b border-border/50 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-6 w-28 rounded-md" />
                        <Skeleton className="h-6 w-36 rounded-md" />
                    </div>
                    <Skeleton className="h-3 w-full max-w-xl" />
                    <Skeleton className="h-3 w-32" />
                </div>
                <div className="p-4 sm:p-5">
                    <Skeleton className="h-[min(24rem,55vh)] w-full rounded-lg" />
                </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="dashboard-card p-4">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="mt-3 h-16 w-full rounded-md" />
                        <Skeleton className="mt-2 h-3 w-24" />
                    </div>
                ))}
            </div>
        </>
    );
}

export function AlertHistoryPageSkeleton() {
    return (
        <>
            <StatTilesRowSkeleton5 />
            <Skeleton className="h-16 w-full rounded-xl" />
            <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="dashboard-card p-5 sm:p-6">
                        <div className="flex gap-4 sm:gap-5">
                            <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
                            <div className="min-w-0 flex-1 space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    <Skeleton className="h-5 w-20 rounded-md" />
                                    <Skeleton className="h-5 w-24 rounded-md" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-[92%]" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-3 w-40" />
                                    <Skeleton className="h-3 w-28" />
                                </div>
                                <Skeleton className="h-32 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export function TeamRosterSkeleton() {
    return (
        <div className="dashboard-card divide-y divide-border overflow-hidden p-0">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-36" />
                        <Skeleton className="h-3 w-52 max-w-full" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-24 rounded-md" />
                        <Skeleton className="h-9 w-24 rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Table body rows for Team Settings roster (desktop). */
export function TeamRosterTableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <tr key={i} className="border-b border-border/60">
                    <td className="px-4 py-3.5 sm:px-5">
                        <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                        <Skeleton className="h-7 w-44 rounded-md" />
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                        <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                        <Skeleton className="h-5 w-16 rounded-md" />
                    </td>
                    <td className="px-4 py-3.5 text-right sm:px-5">
                        <Skeleton className="ml-auto h-9 w-28 rounded-md" />
                    </td>
                </tr>
            ))}
        </>
    );
}

/** Mobile list skeleton for Team Settings. */
/** Three rows matching header notification slide-over items. */
export function NotificationSheetSkeleton() {
    return (
        <ul className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="px-4 py-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-3 w-14" />
                    </div>
                    <Skeleton className="mb-1 h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                    <Skeleton className="mt-2 h-2 w-20" />
                </li>
            ))}
        </ul>
    );
}

export function TeamRosterMobileSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <li key={i} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-2">
                            <Skeleton className="h-4 w-44" />
                            <Skeleton className="h-3 w-36" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-9 w-20 shrink-0 rounded-md" />
                    </div>
                </li>
            ))}
        </>
    );
}

/** Thin top bar while TanStack Query refetches (poll / realtime invalidation). */
export function DataRefetchBar({ active }: { active: boolean }) {
    if (!active) return null;
    return (
        <div
            className="pointer-events-none fixed left-0 right-0 top-0 z-[100] h-0.5 overflow-hidden bg-primary/20"
            role="progressbar"
            aria-label="Refreshing data"
        >
            <div className="h-full w-2/5 max-w-[12rem] bg-primary/75 motion-safe:animate-pulse" />
        </div>
    );
}
