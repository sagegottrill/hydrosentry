import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, BatteryWarning, AlertTriangle, CheckCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSensorNetwork } from '@/hooks/useSensorNetwork';
import { useAlertHistory, type FieldReportKind } from '@/hooks/useAlertHistory';

type NodeOption = {
  id: string;
  name: string;
  location: string;
  publicCode?: string;
};

const DEMO_NODE_OPTIONS: NodeOption[] = [
  { id: 'demo-sn-01', publicCode: 'SN-01', name: 'Ngadda Bridge', location: 'Maiduguri corridor' },
  { id: 'demo-sn-02', publicCode: 'SN-02', name: 'Alau Dam', location: 'Alau intake' },
  { id: 'demo-sn-03', publicCode: 'SN-03', name: 'Customs Bridge', location: 'Customs crossing' },
];

export default function WardenFieldReport() {
  const navigate = useNavigate();
  const { nodes } = useSensorNetwork();
  const { recordFieldReport } = useAlertHistory();

  const options = useMemo<NodeOption[]>(() => {
    if (nodes.length > 0) {
      return nodes.map((n) => ({
        id: n.id,
        name: n.name,
        location: n.location,
        ...(n.publicCode ? { publicCode: n.publicCode } : {}),
      }));
    }
    return DEMO_NODE_OPTIONS;
  }, [nodes]);

  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [status, setStatus] = useState<FieldReportKind | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (options.length === 0) return;
    const valid = options.some((o) => o.id === selectedNodeId);
    if (!valid) setSelectedNodeId(options[0].id);
  }, [options, selectedNodeId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) return;
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

    recordFieldReport({
      nodeId: selected.id,
      nodeName: selected.name,
      location: selected.location,
      ...(selected.publicCode ? { publicCode: selected.publicCode } : {}),
      report: status,
    });

    toast.success('Successfully submitted', {
      description: trimmedNotes
        ? 'Field report and notes logged (demo). Open Alert History to review.'
        : 'Field report synced to Alert History and the header bell.',
    });
    setStatus(null);
    setNotes('');
    navigate('/alerts');
  };

  const cardBase =
    'flex min-h-16 w-full items-center gap-3 rounded-2xl p-4 text-left transition-all duration-200 active:scale-[0.98]';

  return (
    <div className="min-h-dvh w-full max-w-[100vw] overflow-x-hidden bg-slate-100 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 font-sans">
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-blue-900 p-5 text-center text-white sm:p-6">
          <h2 className="text-2xl font-bold">Data Scout Entry</h2>
          <p className="mt-1 text-sm text-blue-200">Mobile Field Reporting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MapPin size={16} /> Node Location
            </label>
            <div className="relative">
              <select
                value={selectedNodeId}
                onChange={(ev) => setSelectedNodeId(ev.target.value)}
                className="h-14 min-h-[3.5rem] w-full appearance-none rounded-2xl border border-slate-200/90 bg-slate-50 py-0 pl-4 pr-11 text-base text-slate-900 outline-none ring-primary/20 transition-shadow focus:border-primary/40 focus:ring-2"
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

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Hardware Status</label>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => setStatus('nominal')}
                className={cn(
                  cardBase,
                  status === 'nominal'
                    ? 'border-2 border-green-500 bg-green-50 shadow-sm'
                    : 'border border-slate-200/90 bg-white shadow-sm',
                )}
              >
                <CheckCircle
                  className={cn(
                    'shrink-0',
                    status === 'nominal' ? 'text-green-600' : 'text-slate-400',
                  )}
                  strokeWidth={status === 'nominal' ? 2.5 : 2}
                />
                <span
                  className={cn(
                    'text-slate-800',
                    status === 'nominal' ? 'font-bold' : 'font-medium',
                  )}
                >
                  Node Nominal (Operational)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('battery')}
                className={cn(
                  cardBase,
                  status === 'battery'
                    ? 'border-2 border-amber-500 bg-amber-50 shadow-sm'
                    : 'border border-slate-200/90 bg-white shadow-sm',
                )}
              >
                <BatteryWarning
                  className={cn(
                    'shrink-0',
                    status === 'battery' ? 'text-amber-600' : 'text-slate-400',
                  )}
                  strokeWidth={status === 'battery' ? 2.5 : 2}
                />
                <span
                  className={cn(
                    'text-slate-800',
                    status === 'battery' ? 'font-bold' : 'font-medium',
                  )}
                >
                  Battery Degraded/Swollen
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('silt')}
                className={cn(
                  cardBase,
                  status === 'silt'
                    ? 'border-2 border-red-500 bg-red-50 shadow-sm'
                    : 'border border-slate-200/90 bg-white shadow-sm',
                )}
              >
                <AlertTriangle
                  className={cn('shrink-0', status === 'silt' ? 'text-red-600' : 'text-slate-400')}
                  strokeWidth={status === 'silt' ? 2.5 : 2}
                />
                <span
                  className={cn(
                    'text-slate-800',
                    status === 'silt' ? 'font-bold' : 'font-medium',
                  )}
                >
                  Sensor Fouled (Silt/Mud)
                </span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="warden-field-notes" className="mb-2 block text-sm font-semibold text-slate-700">
              Field Notes (Optional)
            </label>
            <textarea
              id="warden-field-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Solar panel is covered in dust, requires cleaning..."
              className="w-full min-h-[120px] rounded-2xl bg-slate-50 border border-slate-200 p-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <button
            type="submit"
            disabled={!status}
            className={cn(
              'flex h-16 min-h-[4rem] w-full items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-md transition-all duration-200',
              'hover:opacity-95',
              'active:scale-[0.98]',
              'disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none disabled:active:scale-100',
            )}
          >
            <Send size={20} strokeWidth={2.25} />
            Submit Field Data
          </button>
        </form>
      </div>
    </div>
  );
}
