import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Activity,
  Cpu,
  Droplets,
  Gauge,
  Map as MapIcon,
  Radio,
  Settings2,
  Shield,
  Siren,
  Smartphone,
  Waves,
  Zap,
} from 'lucide-react';
import { DemoCommandMap } from '@/components/demo/DemoCommandMap';
import {
  DEMO_COMMAND_NODES,
  DEMO_SPIKE_NODE_ID,
  type DemoCommandNode,
} from '@/data/demoCommandNodes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const SPIKE_MS = 8_000;
const SPIKE_INTERVAL_MS = 30_000;

type NavKey = 'map' | 'telemetry' | 'dispatch' | 'network';

function effectiveNode(node: DemoCommandNode, spikeActive: boolean): DemoCommandNode {
  if (!spikeActive || node.nodeId !== DEMO_SPIKE_NODE_ID) return node;
  return {
    ...node,
    status: 'warning',
    waterLevel: '4.8m (CRITICAL)',
  };
}

function waterLevelIsCritical(label: string): boolean {
  return label.includes('CRITICAL');
}

export default function LiveDemoDashboard() {
  const navigate = useNavigate();
  const mapAnchorRef = useRef<HTMLDivElement>(null);

  const [selectedId, setSelectedId] = useState<string>(DEMO_COMMAND_NODES[0]!.nodeId);
  const [spikeActive, setSpikeActive] = useState(false);
  const [activeNav, setActiveNav] = useState<NavKey>('map');

  useEffect(() => {
    let spikeTimeout: ReturnType<typeof setTimeout> | undefined;

    const arm = () => {
      setSpikeActive(true);
      if (spikeTimeout) window.clearTimeout(spikeTimeout);
      spikeTimeout = window.setTimeout(() => {
        setSpikeActive(false);
      }, SPIKE_MS);
    };

    const interval = window.setInterval(arm, SPIKE_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      if (spikeTimeout) window.clearTimeout(spikeTimeout);
    };
  }, []);

  const nodes = useMemo(
    () => DEMO_COMMAND_NODES.map((n) => effectiveNode(n, spikeActive)),
    [spikeActive],
  );

  const selected = useMemo(
    () => nodes.find((n) => n.nodeId === selectedId) ?? nodes[0]!,
    [nodes, selectedId],
  );

  const selectedCritical = waterLevelIsCritical(selected.waterLevel);
  const spikeFlash = spikeActive && selected.nodeId === DEMO_SPIKE_NODE_ID;

  const onSelectNode = useCallback((nodeId: string) => {
    setSelectedId(nodeId);
  }, []);

  const onDispatch = useCallback(() => {
    toast.success('Termii API: SMS dispatched to local Wardens successfully.');
  }, []);

  const onNav = useCallback(
    (key: NavKey) => {
      setActiveNav(key);
      if (key === 'dispatch') {
        navigate('/dispatcher');
        return;
      }
      if (key === 'network') {
        navigate('/settings');
        return;
      }
      if (key === 'map') {
        mapAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [navigate],
  );

  return (
    <div className="dark min-h-dvh bg-[#030712] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.08),transparent)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_bottom,rgba(6,182,212,0.04),transparent_40%)]" />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-[1920px] flex-col lg:flex-row">
        {/* PANE 1 — Left */}
        <aside className="flex w-full shrink-0 flex-col border-b border-cyan-950/80 bg-[#050a14]/95 backdrop-blur-sm lg:w-[280px] lg:border-b-0 lg:border-r">
          <div className="border-b border-cyan-950/60 px-4 py-5">
            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" strokeWidth={1.5} />
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cyan-500/90">
                  Classified prototype
                </p>
                <h1 className="mt-1 font-semibold leading-tight tracking-tight text-slate-50">
                  HydroSentry Command Center
                </h1>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                  Sahel Resilience Stack · LoRaWAN / TinyML edge mesh (simulated)
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-3 py-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-emerald-300">LoRaWAN Mesh: ONLINE</p>
                <p className="text-[10px] text-emerald-500/80">AES-128 uplink · CAD trust lane</p>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-md border border-slate-800 bg-slate-950/50 px-2.5 py-2">
                <dt className="text-slate-500">Active Nodes</dt>
                <dd className="font-mono text-sm font-semibold text-cyan-200">10/10</dd>
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-950/50 px-2.5 py-2">
                <dt className="text-slate-500">Warden Guilds</dt>
                <dd className="font-mono text-sm font-semibold text-cyan-200">4 online</dd>
              </div>
            </dl>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 p-3">
            {(
              [
                { key: 'map' as const, label: 'Map View', icon: MapIcon },
                { key: 'telemetry' as const, label: 'Telemetry Stream', icon: Activity },
                { key: 'dispatch' as const, label: 'Alert Dispatch', icon: Siren },
                { key: 'network' as const, label: 'Network Settings', icon: Settings2 },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNav(item.key)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                    active
                      ? 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-100'
                      : 'border border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900/60 hover:text-slate-200',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-cyan-950/60 p-3 text-[10px] text-slate-600">
            Demo session · no live uplink
          </div>
        </aside>

        {/* PANE 2 — Center */}
        <main
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col border-b border-cyan-950/80 transition-shadow duration-500 lg:border-b-0',
            spikeActive && 'shadow-[inset_0_0_0_1px_rgba(251,146,60,0.35)]',
          )}
        >
          <div ref={mapAnchorRef} className="border-b border-cyan-950/60 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-500/90">
                  Tactical grid
                </p>
                <p className="text-sm font-medium text-slate-200">Lake Chad basin · node overlay</p>
              </div>
              {spikeActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200">
                  <Radio className="h-3.5 w-3.5 animate-pulse" />
                  Synthetic surge · {DEMO_SPIKE_NODE_ID}
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">All channels nominal</span>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 p-3 md:p-4">
            <div className="grid h-full min-h-[420px] gap-3 lg:grid-cols-[1fr_minmax(0,340px)] lg:gap-4">
              <div className="flex min-h-0 flex-col gap-3">
                <DemoCommandMap
                  nodes={nodes}
                  selectedId={selectedId}
                  spikeNodeId={DEMO_SPIKE_NODE_ID}
                  spikeFlash={spikeActive}
                  onSelectNode={onSelectNode}
                />

                {activeNav === 'telemetry' ? (
                  <div className="rounded-lg border border-slate-800 bg-black/40 p-3 font-mono text-[10px] leading-relaxed text-emerald-400/90">
                    <p className="text-slate-500">{'//'} uplink trace (simulated)</p>
                    <p className="mt-1 text-emerald-300/80">
                      [telemetry] HS-Alpha-01 · RSSI -102 dBm · SNR 9.2 · bat 88%
                    </p>
                    <p className="text-cyan-300/80">
                      [edge] TinyML inference 42ms · quant model v0.9.4
                    </p>
                    <p className="text-amber-300/90">
                      [watch] {DEMO_SPIKE_NODE_ID} · water column delta +2.1m (DRY RUN)
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-800/80 bg-[#060b14]">
                <div className="border-b border-slate-800 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Network topology
                  </p>
                  <p className="text-xs text-slate-400">Select a node — 10 mesh endpoints</p>
                </div>
                <ul className="grid max-h-[min(52vh,28rem)] grid-cols-1 gap-2 overflow-auto p-2 sm:grid-cols-2 lg:grid-cols-1">
                  {nodes.map((node) => {
                    const isSel = node.nodeId === selectedId;
                    const crit =
                      waterLevelIsCritical(node.waterLevel) || (spikeActive && node.nodeId === DEMO_SPIKE_NODE_ID);
                    return (
                      <li key={node.nodeId}>
                        <button
                          type="button"
                          onClick={() => onSelectNode(node.nodeId)}
                          className={cn(
                            'w-full rounded-lg border px-3 py-2.5 text-left transition-all duration-200 active:scale-[0.99]',
                            isSel
                              ? crit
                                ? 'border-2 border-amber-500/80 bg-amber-500/10 shadow-[0_0_20px_rgba(251,146,60,0.25)]'
                                : 'border-2 border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_16px_rgba(34,211,238,0.12)]'
                              : crit
                                ? 'border border-amber-600/50 bg-amber-500/5'
                                : 'border border-slate-800 bg-slate-950/40 hover:border-slate-700',
                          )}
                        >
                          <p className="font-mono text-xs font-semibold text-slate-100">{node.nodeId}</p>
                          <p className="text-[11px] text-slate-500">{node.locationLabel}</p>
                          <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px]">
                            <span
                              className={cn(
                                'rounded px-1.5 py-0.5 font-semibold uppercase',
                                node.status === 'warning' || crit
                                  ? 'bg-amber-500/15 text-amber-200'
                                  : 'bg-emerald-500/15 text-emerald-300',
                              )}
                            >
                              {crit ? 'Warning' : node.status === 'warning' ? 'Warning' : 'Nominal'}
                            </span>
                            <span className="font-mono text-slate-500">{node.lastSyncLabel}</span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </main>

        {/* PANE 3 — Right */}
        <aside className="flex w-full shrink-0 flex-col border-cyan-950/80 bg-[#050a14]/95 backdrop-blur-sm lg:w-[320px] lg:border-l">
          <div className="border-b border-cyan-950/60 px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-500/90">
              Live telemetry
            </p>
            <p className="mt-1 font-mono text-sm text-slate-200">{selected.nodeId}</p>
            <p className="text-xs text-slate-500">{selected.locationLabel}</p>
          </div>

          <div className="flex flex-1 flex-col gap-3 p-4">
            <div
              className={cn(
                'rounded-xl border p-4 transition-colors duration-300',
                selectedCritical || spikeFlash
                  ? 'border-amber-500/60 bg-amber-500/5 shadow-[inset_0_0_40px_rgba(251,146,60,0.08)]'
                  : 'border-slate-800 bg-slate-950/50',
              )}
            >
              <div className="flex items-center gap-2 text-slate-400">
                <Waves className="h-4 w-4 text-cyan-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Water level</span>
              </div>
              <p
                className={cn(
                  'mt-2 font-mono text-2xl font-semibold',
                  selectedCritical || spikeFlash ? 'text-amber-300' : 'text-slate-100',
                )}
              >
                {selected.waterLevel}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Gauge className="h-4 w-4 text-sky-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Flow velocity</span>
              </div>
              <p className="mt-2 font-mono text-xl text-slate-100">{selected.flowVelocity}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Zap className="h-4 w-4 text-emerald-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Hardware health</span>
              </div>
              <p className="mt-2 text-sm text-slate-200">
                LiFePO<sub className="text-xs">4</sub> Battery:{' '}
                <span className="font-mono font-semibold text-emerald-300">{selected.batteryPct}%</span>
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Cpu className="h-4 w-4 text-violet-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Edge inference</span>
              </div>
              <p className="mt-2 text-sm text-slate-200">
                TinyML Processing:{' '}
                <span className="font-mono font-semibold text-violet-300">{selected.tinyMlLatencyMs}ms</span>
              </p>
            </div>

            <div className="mt-auto pt-2">
              <Button
                type="button"
                className={cn(
                  'h-12 w-full gap-2 rounded-lg font-semibold shadow-lg transition-all duration-300',
                  selectedCritical || spikeFlash
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-[0_0_28px_rgba(251,146,60,0.55)] hover:from-amber-500 hover:to-orange-500'
                    : 'bg-cyan-600 text-slate-950 hover:bg-cyan-500',
                )}
                onClick={onDispatch}
              >
                <Smartphone className="h-4 w-4" />
                Dispatch Warden (SMS)
              </Button>
              <p className="mt-2 text-center text-[10px] text-slate-600">
                <Droplets className="inline h-3 w-3 align-text-bottom text-slate-500" /> Termii-class routing
                (mock)
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
