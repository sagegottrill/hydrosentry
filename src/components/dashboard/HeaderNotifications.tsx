import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAlertHistory } from '@/hooks/useAlertHistory';
import { cn } from '@/lib/utils';

const READ_STORAGE_KEY = 'hydrosentry-header-notif-read';

function loadReadIds(): Set<string> {
    try {
        const raw = sessionStorage.getItem(READ_STORAGE_KEY);
        if (!raw) return new Set();
        const arr = JSON.parse(raw) as string[];
        return new Set(Array.isArray(arr) ? arr : []);
    } catch {
        return new Set();
    }
}

function saveReadIds(ids: Set<string>) {
    sessionStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...ids]));
}

export function HeaderNotifications() {
    const navigate = useNavigate();
    const { alerts } = useAlertHistory();
    const [open, setOpen] = useState(false);
    const [readIds, setReadIds] = useState(loadReadIds);

    const recent = useMemo(() => alerts.slice(0, 8), [alerts]);

    const unreadActive = useMemo(
        () =>
            alerts.filter((a) => a.status === 'active' && !readIds.has(a.id)).length,
        [alerts, readIds],
    );

    const markRead = useCallback((id: string) => {
        setReadIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            saveReadIds(next);
            return next;
        });
    }, []);

    const markAllRead = useCallback(() => {
        const next = new Set(readIds);
        alerts.forEach((a) => next.add(a.id));
        saveReadIds(next);
        setReadIds(next);
        toast.success('Notifications cleared', { description: 'Active items marked as read in this session.' });
    }, [alerts, readIds]);

    const openItem = useCallback(
        (id: string) => {
            markRead(id);
            setOpen(false);
            navigate(`/alerts#alert-${encodeURIComponent(id)}`);
        },
        [markRead, navigate],
    );

    const goAll = useCallback(() => {
        setOpen(false);
        navigate('/alerts');
    }, [navigate]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-md text-muted-foreground hover:bg-muted/80"
                    aria-label={`Notifications${unreadActive > 0 ? `, ${unreadActive} active unread` : ''}`}
                >
                    <Bell className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.5} />
                    {unreadActive > 0 && (
                        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[0.625rem] font-semibold leading-none text-destructive-foreground ring-2 ring-card">
                            {Math.min(9, unreadActive)}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(100vw-2rem,22rem)] p-0" align="end" sideOffset={6}>
                <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                    <p className="text-sm font-semibold text-foreground">Notifications</p>
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-muted-foreground"
                            onClick={markAllRead}
                        >
                            <CheckCheck className="mr-1 h-3.5 w-3.5" />
                            Mark read
                        </Button>
                    </div>
                </div>
                <div className="max-h-[min(60vh,20rem)] overflow-y-auto panel-scroll">
                    {recent.length === 0 ? (
                        <p className="px-3 py-8 text-center text-sm text-muted-foreground">No alerts</p>
                    ) : (
                        <ul className="divide-y divide-border">
                            {recent.map((a) => {
                                const unread = a.status === 'active' && !readIds.has(a.id);
                                return (
                                    <li key={a.id}>
                                        <button
                                            type="button"
                                            className={cn(
                                                'flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition-colors hover:bg-muted/50',
                                                unread && 'bg-destructive/[0.04]',
                                            )}
                                            onClick={() => openItem(a.id)}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className={cn(
                                                        'truncate text-xs font-medium',
                                                        a.severity === 'critical' && 'text-destructive',
                                                        a.severity === 'warning' && 'text-amber-700',
                                                        a.severity === 'info' && 'text-primary',
                                                    )}
                                                >
                                                    {a.sensorName}
                                                </span>
                                                <span className="shrink-0 text-[0.625rem] text-muted-foreground">
                                                    {a.relativeTime}
                                                </span>
                                            </div>
                                            <p className="line-clamp-2 text-xs text-muted-foreground">{a.message}</p>
                                            <span className="text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground/80">
                                                {a.status.replace('_', ' ')}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
                <div className="border-t border-border p-2">
                    <Button type="button" variant="outline" size="sm" className="h-8 w-full text-xs" onClick={goAll}>
                        View all alert history
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
