import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  BatteryWarning,
  AlertTriangle,
  CheckCircle,
  Send,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { formatAssetTag } from '@/lib/assetTags';
import { useSensorNetwork } from '@/hooks/useSensorNetwork';
import { useAlertHistory, type FieldReportKind } from '@/hooks/useAlertHistory';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { insertWardenFieldReport } from '@/lib/wardenFieldReportDb';
import {
  buildWardenCriticalSmsMessage,
  requestWardenCriticalSms,
} from '@/lib/sendWardenCriticalSms';
import type { Season } from '@/types/hydrosentry';

type NodeOption = {
  id: string;
  name: string;
  location: string;
  publicCode?: string;
};

/** Offline fallback — 10-node pilot; tags match Command Center `HS-[LOCATION]-[NUM]`. */
const DEMO_NODE_OPTIONS: NodeOption[] = [
  { id: 'demo-hs-ngadda-001', publicCode: 'HS-NGADDA-001', name: 'Ngadda Bridge Alpha', location: 'Monday Market Bridge' },
  { id: 'demo-hs-gwange-002', publicCode: 'HS-GWANGE-002', name: 'Gwange Drainage Sensor', location: 'Gwange Ward' },
  { id: 'demo-hs-lagos-003', publicCode: 'SN-03', name: 'Lagos Street Node', location: 'Lagos Street Channel' },
  { id: 'demo-hs-alau-004', publicCode: 'HS-ALAU-004', name: 'Alau Dam Monitor', location: 'Alau Dam Spillway' },
  { id: 'demo-hs-jere-005', publicCode: 'HS-JERE-005', name: 'Jere LGA Rain Station', location: 'Jere LGA' },
  { id: 'demo-hs-konduga-006', publicCode: 'HS-KONDUGA-006', name: 'Konduga Flow Meter', location: 'Konduga' },
  { id: 'demo-hs-dikwa-007', publicCode: 'HS-DIKWA-007', name: 'Dikwa Observation Post', location: 'Dikwa' },
  { id: 'demo-hs-bama-008', publicCode: 'HS-BAMA-008', name: 'Bama North Sensor', location: 'Bama LGA' },
  { id: 'demo-hs-marte-010', publicCode: 'HS-MARTE-010', name: 'Marte Relay Node', location: 'Marte LGA' },
  { id: 'demo-hs-gwoza-012', publicCode: 'HS-GWOZA-012', name: 'Gwoza Valley Checkpoint', location: 'Gwoza Valley' },
];

const CARD_BASE =
  'flex min-h-[4.25rem] w-full items-center gap-3 rounded-2xl p-4 text-left transition-all duration-200 active:scale-[0.98] md:min-h-[5.5rem] md:flex-col md:items-center md:justify-center md:gap-2 md:py-5 md:text-center';

const NodeLocationPicker = memo(function NodeLocationPicker({
  selectedNodeId,
  onChange,
  options,
}: {
  selectedNodeId: string;
  onChange: (nextId: string) => void;
  options: NodeOption[];
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <MapPin size={16} /> Node Location
      </label>
      <div className="relative">
        <select
          value={selectedNodeId}
          onChange={(ev) => onChange(ev.target.value)}
          className="h-14 min-h-[3.5rem] w-full appearance-none rounded-2xl border border-slate-200/90 bg-slate-50 py-0 pl-4 pr-[2.75rem] text-base text-slate-900 outline-none ring-primary/20 transition-shadow focus:border-primary/40 focus:ring-2"
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.publicCode ? `${o.publicCode} — ${o.name}` : o.name} · {o.location}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
});

const HardwareStatusCards = memo(function HardwareStatusCards({
  status,
  onPick,
  isSubmitting,
}: {
  status: FieldReportKind | null;
  onPick: (next: FieldReportKind) => void;
  isSubmitting: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">Hardware Status</label>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        <button
          type="button"
          onClick={() => onPick('nominal')}
          disabled={isSubmitting}
          className={cn(
            CARD_BASE,
            status === 'nominal'
              ? 'border-2 border-green-500 bg-green-50 shadow-sm'
              : 'border border-slate-200/90 bg-white shadow-sm',
            isSubmitting && 'pointer-events-none opacity-60',
          )}
        >
          <CheckCircle
            className={cn('shrink-0', status === 'nominal' ? 'text-green-600' : 'text-slate-400')}
            strokeWidth={status === 'nominal' ? 2.5 : 2}
          />
          <span className={cn('text-sm text-slate-800 sm:text-base', status === 'nominal' ? 'font-bold' : 'font-medium')}>
            Node Nominal (Operational)
          </span>
        </button>

        <button
          type="button"
          onClick={() => onPick('battery')}
          disabled={isSubmitting}
          className={cn(
            CARD_BASE,
            status === 'battery'
              ? 'border-2 border-amber-500 bg-amber-50 shadow-sm'
              : 'border border-slate-200/90 bg-white shadow-sm',
            isSubmitting && 'pointer-events-none opacity-60',
          )}
        >
          <BatteryWarning
            className={cn('shrink-0', status === 'battery' ? 'text-amber-600' : 'text-slate-400')}
            strokeWidth={status === 'battery' ? 2.5 : 2}
          />
          <span className={cn('text-sm text-slate-800 sm:text-base', status === 'battery' ? 'font-bold' : 'font-medium')}>
            Battery Degraded/Swollen
          </span>
        </button>

        <button
          type="button"
          onClick={() => onPick('silt')}
          disabled={isSubmitting}
          className={cn(
            CARD_BASE,
            status === 'silt'
              ? 'border-2 border-red-500 bg-red-50 shadow-sm'
              : 'border border-slate-200/90 bg-white shadow-sm',
            isSubmitting && 'pointer-events-none opacity-60',
          )}
        >
          <AlertTriangle
            className={cn('shrink-0', status === 'silt' ? 'text-red-600' : 'text-slate-400')}
            strokeWidth={status === 'silt' ? 2.5 : 2}
          />
          <span className={cn('text-sm text-slate-800 sm:text-base', status === 'silt' ? 'font-bold' : 'font-medium')}>
            Sensor Fouled (Silt/Mud)
          </span>
        </button>
      </div>
    </div>
  );
});

const FieldNotes = memo(function FieldNotes({
  notes,
  onChange,
  isSubmitting,
}: {
  notes: string;
  onChange: (next: string) => void;
  isSubmitting: boolean;
}) {
  return (
    <div>
      <label htmlFor="warden-field-notes" className="mb-2 block text-sm font-semibold text-slate-700">
        Field Notes (Optional)
      </label>
      <textarea
        id="warden-field-notes"
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        disabled={isSubmitting}
        placeholder="E.g., Solar panel is covered in dust, requires cleaning..."
        className="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-slate-50 p-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
      />
    </div>
  );
});

export default function WardenFieldReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { nodes, isLoading: sensorNetLoading } = useSensorNetwork();
  const { recordFieldReport } = useAlertHistory();

  const fieldReportSeason: Season = searchParams.get('season') === 'dry' ? 'dry' : 'wet';

  const options = useMemo<NodeOption[]>(() => {
    if (nodes.length > 0) {
      return nodes
        .filter((n) => {
          const pc = (n.publicCode ?? '').toUpperCase();
          if (pc === 'SN-009') return false;
          if (n.name.toLowerCase().includes('monguno')) return false;
          return true;
        })
        .map((n) => ({
          id: n.id,
          name: n.name,
          location: n.location,
          publicCode: formatAssetTag(n.publicCode ?? n.id),
        }));
    }
    return DEMO_NODE_OPTIONS;
  }, [nodes]);

  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [status, setStatus] = useState<FieldReportKind | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onPickStatus = useCallback((next: FieldReportKind) => setStatus(next), []);
  const onNotesChange = useCallback((next: string) => setNotes(next), []);
  const onNodeChange = useCallback((nextId: string) => setSelectedNodeId(nextId), []);

  useEffect(() => {
    if (options.length === 0) return;
    const valid = options.some((o) => o.id === selectedNodeId);
    if (!valid) setSelectedNodeId(options[0].id);
  }, [options, selectedNodeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sensorNetLoading && isSupabaseConfigured) return;
    if (!status || isSubmitting) return;
    const selected = options.find((o) => o.id === selectedNodeId);
    if (!selected) return;

    const trimmedNotes = notes.trim();

    console.log('[WardenFieldReport] submitted', {
      nodeId: selected.id,
      nodeName: selected.name,
      location: selected.location,
      publicCode: selected.publicCode,
      report: status,
      notes: trimmedNotes || '(none)',
    });

    setIsSubmitting(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const result = await insertWardenFieldReport({
          sensorNodeId: selected.id,
          nodeLabel: selected.name,
          nodeLocation: selected.location,
          ...(selected.publicCode ? { publicCode: selected.publicCode } : {}),
          status,
          notesTrimmed: trimmedNotes,
          season: fieldReportSeason,
        });

        if ('error' in result) {
          toast.error('Could not sync report', { description: result.error });
          return;
        }
      }

      recordFieldReport({
        nodeId: selected.id,
        nodeName: selected.name,
        location: selected.location,
        ...(selected.publicCode ? { publicCode: selected.publicCode } : {}),
        report: status,
      });

      const smsMessage = buildWardenCriticalSmsMessage({
        status,
        nodeLabel: selected.name,
        nodeLocation: selected.location,
        ...(selected.publicCode ? { publicCode: selected.publicCode } : {}),
        notes: trimmedNotes,
      });

      let criticalSmsOk = false;
      if (smsMessage) {
        try {
          // Recipients: server loads alert_sms_recipients (admin | dispatcher) from Supabase, then Termii per number.
          const smsOutcome = await requestWardenCriticalSms(smsMessage);
          if (smsOutcome.skipped) {
            console.info('[WardenFieldReport] Critical SMS skipped: no active admin/dispatcher numbers in DB.');
            toast.message('Report saved; no SMS recipients', {
              description:
                'Add rows to alert_sms_recipients (role admin or dispatcher) in Supabase to enable Termii.',
            });
          } else if (smsOutcome.sent > 0) {
            criticalSmsOk = true;
          } else {
            console.warn('[WardenFieldReport] Termii dispatch attempted but no successful sends.');
            toast.warning('Report saved; SMS not delivered', {
              description: 'Check Termii credentials and recipient numbers in alert_sms_recipients.',
            });
          }
        } catch (smsErr) {
          const msg = smsErr instanceof Error ? smsErr.message : 'SMS failed';
          console.warn('[WardenFieldReport] SMS request error:', msg);
          toast.warning('Report saved; SMS not sent', { description: msg });
        }
      }

      const baseDescription = isSupabaseConfigured
        ? 'Report saved; Dispatch queue will show it on the dashboard.'
        : trimmedNotes
          ? 'Field report and notes logged (offline). Open Alert History to review.'
          : 'Field report synced to Alert History and the header bell.';

      toast.success('Successfully submitted', {
        description:
          smsMessage && criticalSmsOk
            ? `${baseDescription} Critical SMS sent via Termii to configured recipients.`
            : baseDescription,
      });
      setStatus(null);
      setNotes('');
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  // CARD_BASE lives above; keep it stable so typing in notes doesn't re-render the whole form.

  return (
    <div className="flex min-h-dvh min-h-[100dvh] w-full max-w-[100vw] flex-col overflow-x-hidden bg-slate-100 font-sans text-slate-900 antialiased">
      {/* Mobile: edge-to-edge full-height sheet. Desktop: centered card with comfortable width. */}
      <main
        className={cn(
          'flex w-full flex-1 flex-col bg-white shadow-sm',
          'min-h-0 min-h-dvh',
          'pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]',
          'sm:mx-auto sm:my-6 sm:min-h-0 sm:max-h-[min(100dvh-3rem,56rem)] sm:w-[calc(100%-2rem)] sm:max-w-2xl sm:flex-initial sm:overflow-y-auto sm:rounded-2xl sm:border sm:border-slate-200/90 sm:shadow-xl',
          'lg:my-10 lg:max-w-3xl lg:w-full',
        )}
      >
        <header className="shrink-0 border-b border-blue-800/30 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 px-4 py-4 text-white sm:rounded-t-2xl sm:px-8 sm:py-6">
          <div className="flex items-start gap-3 sm:items-center">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-0.5 shrink-0 rounded-xl p-2 text-blue-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 sm:mt-0"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Warden Field Report</h1>
              <p className="mt-1 text-sm leading-snug text-blue-200/95">
                Field hardware check — works on phone or laptop
              </p>
            </div>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10"
          aria-busy={sensorNetLoading && isSupabaseConfigured}
        >
          {sensorNetLoading && isSupabaseConfigured ? (
            <div className="flex min-h-0 flex-1 flex-col gap-6" aria-label="Loading field nodes from database">
              <div>
                <Skeleton className="mb-2 h-4 w-40" />
                <Skeleton className="h-14 w-full rounded-2xl" />
              </div>
              <div>
                <Skeleton className="mb-3 h-4 w-48" />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Skeleton className="h-[4.25rem] rounded-2xl sm:min-h-[5.5rem]" />
                  <Skeleton className="h-[4.25rem] rounded-2xl sm:min-h-[5.5rem]" />
                  <Skeleton className="h-[4.25rem] rounded-2xl sm:min-h-[5.5rem]" />
                </div>
              </div>
              <div>
                <Skeleton className="mb-2 h-4 w-44" />
                <Skeleton className="min-h-[120px] w-full rounded-2xl" />
              </div>
              <Skeleton className="mt-auto h-14 w-full shrink-0 rounded-2xl sm:h-16" />
            </div>
          ) : (
            <>
          <div className="flex min-h-0 flex-1 flex-col gap-6">
            <NodeLocationPicker selectedNodeId={selectedNodeId} onChange={onNodeChange} options={options} />

            <HardwareStatusCards status={status} onPick={onPickStatus} isSubmitting={isSubmitting} />

            <FieldNotes notes={notes} onChange={onNotesChange} isSubmitting={isSubmitting} />
          </div>

          <button
            type="submit"
            disabled={!status || isSubmitting}
            className={cn(
              'mt-auto flex h-14 min-h-14 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-md transition-all duration-200 sm:h-16 sm:min-h-[4rem] sm:text-lg',
              'hover:opacity-95',
              'active:scale-[0.98]',
              'disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none disabled:active:scale-100',
            )}
          >
            {isSubmitting ? (
              <Loader2 className="h-6 w-6 shrink-0 animate-spin" aria-hidden />
            ) : (
              <Send size={20} strokeWidth={2.25} />
            )}
            {isSubmitting ? 'Submitting…' : 'Submit field data'}
          </button>
            </>
          )}
        </form>
      </main>
    </div>
  );
}
