import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserCog, Phone, ShieldCheck, ShieldAlert, Plus, RefreshCw, Ban, RotateCcw } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { TeamRosterMobileSkeleton, TeamRosterTableSkeleton } from '@/components/dashboard/DashboardSkeletons';

type TeamRole = 'admin' | 'dispatcher';

type SmsRecipientRow = {
  id: string;
  display_name: string;
  phone_number: string;
  role: TeamRole;
  is_active: boolean;
  created_at: string;
};

/** Command-center SMS recipients (not field wardens). Shown when DB is empty or merged in. */
type RosterMember = {
  id: string;
  display_name: string;
  phone_number: string;
  role: TeamRole;
  /** Human-readable RBAC title for UI (admin/dispatcher in DB are backend roles). */
  roleTitle: string;
  is_active: boolean;
  created_at: string;
  source: 'seed' | 'database';
};

const QUERY_KEY = ['alert-sms-recipients'];

/** Living narrative: core Orivon Edge command roster (MSISDNs are mock 13-digit Nigeria format). */
const COMMAND_CENTER_SEED: Omit<RosterMember, 'source'>[] = [
  {
    id: 'seed-cc-dibal',
    display_name: 'Ibrahim Salka',
    phone_number: '2348034567890',
    role: 'admin',
    roleTitle: 'Admin (Lead Architect)',
    is_active: true,
    created_at: '2026-01-08T10:00:00Z',
  },
  {
    id: 'seed-cc-mustapha',
    display_name: 'Amina Mustapha',
    phone_number: '2348124567890',
    role: 'admin',
    roleTitle: 'Admin (Director)',
    is_active: true,
    created_at: '2026-01-08T10:00:00Z',
  },
  {
    id: 'seed-cc-shehu',
    display_name: 'Abubakar Shehu',
    phone_number: '2349054567890',
    role: 'dispatcher',
    roleTitle: 'Lead Dispatcher',
    is_active: true,
    created_at: '2026-01-08T10:00:00Z',
  },
];

function normalizeMsisdn(raw: string): string {
  return raw.replace(/\D/g, '');
}

/** Nigeria country code + NSN: 13 digits total (e.g. 2348030000000). */
function isLikelyNigeriaMsisdn(digits: string): boolean {
  if (digits.startsWith('234')) return digits.length === 13;
  return digits.length >= 10 && digits.length <= 15;
}

function dbRoleTitle(role: TeamRole): string {
  return role === 'admin' ? 'Admin (command center)' : 'Dispatcher (command center)';
}

async function fetchRecipients(): Promise<SmsRecipientRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('alert_sms_recipients')
    .select('id, display_name, phone_number, role, is_active, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as SmsRecipientRow[];
}

export default function TeamSettings() {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [role, setRole] = useState<TeamRole>('dispatcher');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  /** Seed row active flags (revoke/restore without DB). */
  const [seedActiveById, setSeedActiveById] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(COMMAND_CENTER_SEED.map((s) => [s.id, s.is_active])),
  );

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchRecipients,
    enabled: isSupabaseConfigured && supabase !== null,
    staleTime: 5_000,
  });

  const recipients = useMemo(() => query.data ?? [], [query.data]);

  const seedPhones = useMemo(
    () => new Set(COMMAND_CENTER_SEED.map((s) => normalizeMsisdn(s.phone_number))),
    [],
  );

  const rosterMembers = useMemo((): RosterMember[] => {
    const seeds: RosterMember[] = COMMAND_CENTER_SEED.map((s) => ({
      ...s,
      is_active: seedActiveById[s.id] !== false,
      source: 'seed' as const,
    }));

    const fromDb: RosterMember[] = recipients
      .filter((r) => !seedPhones.has(normalizeMsisdn(r.phone_number)))
      .map((r) => ({
        id: r.id,
        display_name: r.display_name,
        phone_number: r.phone_number,
        role: r.role,
        roleTitle: dbRoleTitle(r.role),
        is_active: r.is_active,
        created_at: r.created_at,
        source: 'database' as const,
      }));

    return [...seeds, ...fromDb];
  }, [recipients, seedActiveById, seedPhones]);

  const canSubmit = useMemo(() => {
    const digits = normalizeMsisdn(phone);
    return Boolean(name.trim()) && Boolean(role) && isLikelyNigeriaMsisdn(digits);
  }, [name, role, phone]);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      toast.error('Supabase not configured', { description: 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' });
      return;
    }
    const displayName = name.trim();
    const msisdn = normalizeMsisdn(phone);
    if (!displayName || !isLikelyNigeriaMsisdn(msisdn)) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('alert_sms_recipients').insert({
        display_name: displayName,
        phone_number: msisdn,
        role,
        is_active: true,
      });
      if (error) {
        toast.error('Could not add team member', { description: error.message });
        return;
      }
      toast.success('Team member added', { description: 'Recipient list updated.' });
      setName('');
      setPhone('');
      setRole('dispatcher');
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (row: SmsRecipientRow) => {
    if (!supabase) return;
    const next = !row.is_active;
    const { error } = await supabase.from('alert_sms_recipients').update({ is_active: next }).eq('id', row.id);
    if (error) {
      toast.error('Update failed', { description: error.message });
      return;
    }
    toast.success(next ? 'Recipient activated' : 'Recipient deactivated', {
      description: `${row.display_name || 'Member'} will ${next ? '' : 'not '}receive critical SMS.`,
    });
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  const setSeedActive = (id: string, active: boolean) => {
    setSeedActiveById((prev) => ({ ...prev, [id]: active }));
    toast.success(active ? 'Access restored' : 'Access revoked', {
      description: active ? 'Seed roster member can receive critical SMS again (UI).' : 'Seed roster member marked inactive (UI).',
    });
  };

  const revokeOrRestoreMember = async (m: RosterMember) => {
    if (m.source === 'seed') {
      setSeedActive(m.id, !m.is_active);
      return;
    }
    await toggleActive({
      id: m.id,
      display_name: m.display_name,
      phone_number: m.phone_number,
      role: m.role,
      is_active: m.is_active,
      created_at: m.created_at,
    });
  };

  return (
    <DashboardLayout>
      <div className="dashboard-shell">
        <PageHeader
          variant="compact"
          icon={UserCog}
          title="Team settings"
          description="Command-center SMS recipients for critical Termii alerts. Field wardens use the Data Scout app; this roster is ops leadership and dispatch."
          actions={
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 border-border/80 bg-card shadow-sm"
              onClick={() => void query.refetch()}
              disabled={!isSupabaseConfigured || query.isFetching}
            >
              <RefreshCw className={cn('h-4 w-4', query.isFetching && 'animate-spin')} />
              Refresh
            </Button>
          }
        />

        <div className="surface-card overflow-hidden">
          <div className="border-b border-border/50 bg-muted/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Add team member</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add <span className="font-medium text-foreground">command-center</span> contacts only. Use 13-digit Nigeria MSISDNs (
              <span className="font-mono">234</span> + 10 digits). Field scouts are not added here.
            </p>
          </div>

          <form onSubmit={onAdd} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-foreground">Full name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g., Operations lead"
                className="h-11 bg-background"
                autoComplete="name"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-foreground">Role</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as TeamRole)}
                  className="h-11 w-full appearance-none rounded-md border border-input bg-background px-3 pr-9 text-sm text-foreground outline-none ring-offset-background focus:border-primary/25 focus:ring-2 focus:ring-primary/20"
                >
                  <option value="dispatcher">Dispatcher (command center)</option>
                  <option value="admin">Admin (command center)</option>
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-foreground">Phone number</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., 2348030000000 (13 digits)"
                className="h-11 bg-background font-mono text-sm"
                inputMode="numeric"
                autoComplete="tel"
              />
            </div>

            <div className="sm:col-span-6">
              <Button
                type="submit"
                className="h-11 w-full rounded-lg font-semibold shadow-sm"
                disabled={!canSubmit || submitting || !isSupabaseConfigured}
              >
                <Plus className="h-4 w-4" />
                Add team member
              </Button>
              {!isSupabaseConfigured ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Supabase is not configured in this environment. The roster UI will stay in demo mode.
                </p>
              ) : null}
            </div>
          </form>
        </div>

        <div className="surface-card overflow-hidden">
          <div className="border-b border-border/50 bg-muted/10 px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active team roster</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Command-center MSISDNs that receive critical Termii SMS from field scout reports and automation.
            </p>
          </div>

          <div className="panel-scroll max-h-[min(70vh,40rem)] overflow-auto">
            {query.isError ? (
              <div className="border-b border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive sm:px-5">
                {(query.error as Error)?.message || 'Failed to load additional recipients from Supabase.'} Seed roster
                below still applies for narrative continuity.
              </div>
            ) : null}

            <div className="hidden md:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 sm:px-5">Full name</th>
                    <th className="px-4 py-3 sm:px-5">Role</th>
                    <th className="px-4 py-3 sm:px-5">Phone</th>
                    <th className="px-4 py-3 sm:px-5">Status</th>
                    <th className="px-4 py-3 text-right sm:px-5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {query.isPending && isSupabaseConfigured ? (
                    <TeamRosterTableSkeleton rows={5} />
                  ) : (
                    rosterMembers.map((m) => (
                    <tr key={m.id} className="border-b border-border/60 transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3.5 font-semibold text-foreground sm:px-5">{m.display_name}</td>
                      <td className="px-4 py-3.5 sm:px-5">
                        <span
                          className={cn(
                            'inline-flex max-w-[16rem] items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium',
                            m.role === 'admin'
                              ? 'border-primary/25 bg-primary/10 text-primary'
                              : 'border-amber-200/90 bg-amber-50 text-amber-900',
                          )}
                        >
                          {m.role === 'admin' ? (
                            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                          ) : (
                            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                          )}
                          <span className="leading-snug">{m.roleTitle}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-foreground sm:px-5">
                        {normalizeMsisdn(m.phone_number)}
                      </td>
                      <td className="px-4 py-3.5 sm:px-5">
                        <span
                          className={cn(
                            'inline-flex rounded-md px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide',
                            m.is_active
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                              : 'border border-slate-200 bg-slate-100 text-slate-600',
                          )}
                        >
                          {m.is_active ? 'active' : 'revoked'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right sm:px-5">
                        <Button
                          type="button"
                          variant={m.is_active ? 'outline' : 'secondary'}
                          size="sm"
                          className={cn(
                            'h-9 gap-1.5 font-medium',
                            m.is_active && 'border-rose-200/80 text-rose-800 hover:bg-rose-50 hover:text-rose-900',
                          )}
                          onClick={() => void revokeOrRestoreMember(m)}
                          disabled={m.source === 'database' && !isSupabaseConfigured}
                        >
                          {m.is_active ? (
                            <>
                              <Ban className="h-3.5 w-3.5" />
                              Revoke access
                            </>
                          ) : (
                            <>
                              <RotateCcw className="h-3.5 w-3.5" />
                              Restore access
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-border/60 md:hidden">
              {query.isPending && isSupabaseConfigured ? (
                <TeamRosterMobileSkeleton rows={5} />
              ) : (
                rosterMembers.map((m) => (
                <li key={m.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{m.display_name}</p>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">{m.roleTitle}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1.5 font-mono text-xs text-foreground">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {normalizeMsisdn(m.phone_number)}
                        </span>
                        <span
                          className={cn(
                            'rounded-md px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide',
                            m.is_active
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                              : 'border border-slate-200 bg-slate-100 text-slate-600',
                          )}
                        >
                          {m.is_active ? 'active' : 'revoked'}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant={m.is_active ? 'outline' : 'secondary'}
                      size="sm"
                      className={cn(
                        'shrink-0 gap-1',
                        m.is_active && 'border-rose-200/80 text-rose-800',
                      )}
                      onClick={() => void revokeOrRestoreMember(m)}
                      disabled={m.source === 'database' && !isSupabaseConfigured}
                    >
                      {m.is_active ? (
                        <>
                          <Ban className="h-3.5 w-3.5" />
                          Revoke
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-3.5 w-3.5" />
                          Restore
                        </>
                      )}
                    </Button>
                  </div>
                </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

