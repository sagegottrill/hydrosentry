import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserCog, Phone, ShieldCheck, ShieldAlert, Plus, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

type TeamRole = 'admin' | 'dispatcher';

type SmsRecipientRow = {
  id: string;
  display_name: string;
  phone_number: string;
  role: TeamRole;
  is_active: boolean;
  created_at: string;
};

const QUERY_KEY = ['alert-sms-recipients'];

function normalizeMsisdn(raw: string): string {
  return raw.replace(/\D/g, '');
}

function isLikelyNigeriaMsisdn(digits: string): boolean {
  // 234 + 10 digits (common). Keep loose so other CCs work if you expand later.
  return digits.length >= 10 && digits.length <= 15 && (digits.startsWith('234') || digits.length >= 10);
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

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchRecipients,
    enabled: isSupabaseConfigured && supabase !== null,
    staleTime: 5_000,
  });

  const recipients = query.data ?? [];

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

  return (
    <DashboardLayout>
      <div className="dashboard-shell">
        <PageHeader
          variant="compact"
          icon={UserCog}
          title="Team settings"
          description="Manage critical SMS recipients for the dispatcher queue."
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
              Phone numbers must be digits only (format: <span className="font-mono">234…</span>). Roles: admin or dispatcher.
            </p>
          </div>

          <form onSubmit={onAdd} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-foreground">Warden name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g., Ops Lead"
                className="h-11 bg-background"
                autoComplete="off"
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
                  <option value="dispatcher">dispatcher</option>
                  <option value="admin">admin</option>
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
              <label className="mb-1 block text-xs font-semibold text-foreground">Phone number (234…)</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="2348143084473"
                className="h-11 bg-background font-mono"
                inputMode="numeric"
                autoComplete="off"
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
          <div className="border-b border-border/50 bg-muted/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active team roster</p>
            <p className="mt-1 text-xs text-muted-foreground">
              These numbers receive critical Termii alerts from warden reports.
            </p>
          </div>

          <div className="panel-scroll max-h-[min(70vh,40rem)] overflow-auto">
            {query.isError ? (
              <div className="p-6 text-sm text-destructive">
                {(query.error as Error)?.message || 'Failed to load recipients.'}
              </div>
            ) : recipients.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No team members yet. Add an admin or dispatcher above.
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {recipients.map((r) => (
                  <li key={r.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="min-w-0 truncate text-sm font-semibold text-foreground">
                          {r.display_name || 'Team member'}
                        </p>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide',
                            r.role === 'admin'
                              ? 'border border-primary/20 bg-primary/10 text-primary'
                              : 'border border-amber-200 bg-amber-50 text-amber-800',
                          )}
                        >
                          {r.role === 'admin' ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                          {r.role}
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-md px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide',
                            r.is_active
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border border-slate-200 bg-slate-50 text-slate-600',
                          )}
                        >
                          {r.is_active ? 'active' : 'inactive'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span className="font-mono text-foreground">{normalizeMsisdn(r.phone_number)}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 gap-2 border-border/80 bg-card shadow-sm"
                        onClick={() => void toggleActive(r)}
                        disabled={!isSupabaseConfigured}
                      >
                        {r.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

