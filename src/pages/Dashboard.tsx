import { useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { CrisisMap } from '@/components/dashboard/CrisisMap';
import { SeasonToggle } from '@/components/dashboard/SeasonToggle';
import { ActionDispatcher } from '@/components/dashboard/ActionDispatcher';
import { useHydroData, useAlerts } from '@/hooks/useHydroData';
import { useSensorNetwork } from '@/hooks/useSensorNetwork';
import { useToast } from '@/hooks/use-toast';
import { buildTelemetryAlerts } from '@/lib/sensorTelemetry';
import type { Alert, Season } from '@/types/hydrosentry';
import { LayoutDashboard } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast: legacyToast } = useToast();

  const {
    season,
    setSeason,
    riskZones,
    boreholes,
    routes,
    metrics,
    sparklineData,
    edgeHardwareSpec,
  } = useHydroData();

  const { nodes: sensorNodes, stats: sensorStats } = useSensorNetwork();
  const { alerts, dispatchAction } = useAlerts();

  useEffect(() => {
    const forcedSeason = searchParams.get('season') as Season | null;
    if (forcedSeason && (forcedSeason === 'wet' || forcedSeason === 'dry')) {
      setSeason(forcedSeason);
    }
  }, [searchParams, setSeason]);

  const seasonAlerts = useMemo(() => {
    const fromTelemetry = buildTelemetryAlerts(sensorNodes).filter((a) => a.season === season);
    const fromOps = alerts.filter((a) => a.season === season);
    const merged: Alert[] = [...fromTelemetry, ...fromOps];
    const pr: Record<Alert['priority'], number> = { critical: 0, warning: 1, info: 2 };
    merged.sort((a, b) => pr[a.priority] - pr[b.priority]);
    return merged;
  }, [sensorNodes, alerts, season]);

  const edgeSparkline = useMemo(
    () =>
      [1, 2, 3, 4, 5, 6, 7].map((day) => ({
        day,
        value: Math.min(3.2, 2.92 + day * 0.035 + (sensorStats.avgBatteryVoltage - 3.05) * 0.2),
      })),
    [sensorStats.avgBatteryVoltage],
  );

  const edgeCardStatus =
    sensorStats.hydroCritical > 0
      ? ('critical' as const)
      : sensorStats.lowBattery + sensorStats.hydroWarning > 0
        ? ('warning' as const)
        : ('success' as const);

  const handleDispatch = (alertId: string, actionType: string) => {
    const result = dispatchAction(alertId);

    if (result.success) {
      legacyToast({
        title: '✓ Action Dispatched',
        description: result.message,
        className: 'bg-primary text-primary-foreground border-primary',
      });
    }
  };

  const handleMapDispatch = (_type: string, _id: string) => {
    const workOrderNumber = Math.floor(400 + Math.random() * 100);
    legacyToast({
      title: '✓ Command Order Dispatched',
      description: `Directive #${workOrderNumber} sent to field personnel`,
      className: 'bg-primary text-primary-foreground border-primary',
    });
  };

  const drill = useCallback((label: string, path: string) => {
    toast.message('Opening', { description: label });
    navigate(path);
  }, [navigate]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `NGN ${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `NGN ${(amount / 1000000).toFixed(1)}M`;
    }
    return `NGN ${amount.toLocaleString()}`;
  };

  return (
    <DashboardLayout>
      <div className="dashboard-overview-root">
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden max-md:min-h-min max-md:flex-none max-md:overflow-visible">
          <PageHeader variant="compact" icon={LayoutDashboard} title="Operations overview" />

          {/* KPI row: expands with sidebar width; equal-height cells */}
          <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-5">
            <div className="min-h-0 min-w-0">
              <MetricCard
                title="Est. flood risk value"
                value={formatCurrency(metrics.floodRiskValue.amount)}
                trend={metrics.floodRiskValue.trend}
                sparklineData={sparklineData.floodRisk}
                sparklineColor="hsl(var(--primary))"
                onClick={() => drill('Water level analytics', '/analytics')}
              />
            </div>
            <div className="min-h-0 min-w-0">
              <MetricCard
                title="Borehole failures"
                value={`${metrics.boreholeFailures.count} sites`}
                status={metrics.boreholeFailures.status === 'stable' ? 'neutral' : metrics.boreholeFailures.status}
                sparklineData={sparklineData.boreholeFailures}
                sparklineColor="#d97706"
                onClick={() => drill('Work orders', '/dispatcher')}
              />
            </div>
            <div className="min-h-0 min-w-0">
              <MetricCard
                title="Conflict probability (7d)"
                value={`${metrics.conflictProbability.percentage}% ${metrics.conflictProbability.level.charAt(0).toUpperCase() + metrics.conflictProbability.level.slice(1)}`}
                subtitle={metrics.conflictProbability.location}
                sparklineData={sparklineData.conflictProb}
                sparklineColor="#d97706"
                onClick={() => drill('System configuration (CRPD)', '/settings')}
              />
            </div>
            <div className="min-h-0 min-w-0">
              <MetricCard
                title="Safe corridors"
                value={`${metrics.safeCorridors.count} routes`}
                status="success"
                sparklineData={sparklineData.corridors}
                sparklineColor="#059669"
                onClick={() =>
                  toast.message('Safe corridors', { description: 'Routes are shown on the situational map below.' })
                }
              />
            </div>
            <div className="min-h-0 min-w-0 sm:col-span-2 lg:col-span-1">
              <MetricCard
                title={`${edgeHardwareSpec.mcuFamily} · LiFePO₄`}
                value={`${sensorStats.avgBatteryVoltage.toFixed(2)} V`}
                subtitle={`${edgeHardwareSpec.ultrasonicModel} · ${sensorStats.lowBattery} low · ${sensorStats.hydroCritical} crit`}
                status={edgeCardStatus}
                sparklineData={edgeSparkline}
                sparklineColor="#0284c7"
                onClick={() => drill('Sensor network', '/sensors')}
              />
            </div>
          </div>

          {/* Map + dispatch: share remaining height; each scrolls internally */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden max-md:min-h-min max-md:flex-none max-md:overflow-visible lg:grid-cols-[minmax(0,1fr)_min(18rem,100%)] xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="surface-card flex min-h-[min(52svh,22rem)] min-w-0 flex-col overflow-hidden p-3 sm:min-h-[16rem] sm:p-4 md:min-h-0 md:flex-1">
              <div className="mb-3 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">Situational map</h2>
                  <p className="text-2xs text-muted-foreground">Zones, routes, boreholes, nodes</p>
                </div>
                <SeasonToggle season={season} onSeasonChange={setSeason} />
              </div>
              <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-border">
                <CrisisMap
                  season={season}
                  riskZones={riskZones}
                  boreholes={boreholes}
                  routes={routes}
                  onDispatch={handleMapDispatch}
                  sensorNodes={sensorNodes}
                />
              </div>
            </div>

            <div className="flex min-h-[14rem] min-w-0 flex-col overflow-hidden max-md:max-h-none lg:h-full lg:max-h-none">
              <ActionDispatcher alerts={seasonAlerts} onDispatch={handleDispatch} className="min-h-0 flex-1" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
