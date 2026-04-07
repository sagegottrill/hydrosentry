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
import { useDashboardSparkPulse } from '@/hooks/useDashboardSparkPulse';
import { buildTelemetryAlerts } from '@/lib/sensorTelemetry';
import type { Alert, Season } from '@/types/hydrosentry';
import { Activity, Gauge, LayoutDashboard } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import {
  DashboardMapAndDispatchSkeleton,
  DataRefetchBar,
  MetricCardSkeleton,
} from '@/components/dashboard/DashboardSkeletons';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    season,
    setSeason,
    riskZones,
    boreholes,
    routes,
    metrics,
    edgeHardwareSpec,
  } = useHydroData();

  const {
    nodes: sensorNodes,
    stats: sensorStats,
    isLoading: sensorsLoading,
    isFetching: sensorsFetching,
  } = useSensorNetwork();
  const { sparklines, edgeSparkline, ingressLatencyMs, flowVelocityMs } = useDashboardSparkPulse(
    sensorStats.avgBatteryVoltage,
  );
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

  const edgeCardStatus =
    sensorStats.hydroCritical > 0
      ? ('critical' as const)
      : sensorStats.lowBattery + sensorStats.hydroWarning > 0
        ? ('warning' as const)
        : ('success' as const);

  const handleDispatch = (alertId: string, actionType: string) => {
    if (actionType === 'Alert Technician') {
      return;
    }
    dispatchAction(alertId);
  };

  const handleMapDispatch = (_type: string, _id: string) => {
    const workOrderNumber = Math.floor(400 + Math.random() * 100);
    toast.success('System Action Logged', {
      description: `Command order #${workOrderNumber} sent to field personnel.`,
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
      <DataRefetchBar active={sensorsFetching && !sensorsLoading} />
      <div className="dashboard-overview-root">
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden max-md:min-h-min max-md:flex-none max-md:overflow-visible">
          <PageHeader variant="compact" icon={LayoutDashboard} title="Operations overview" />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-2xs text-muted-foreground sm:text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground/90">
              <Activity className="h-3.5 w-3.5 shrink-0 text-primary motion-safe:animate-pulse-slow" strokeWidth={1.75} />
              Query latency{' '}
              <span className="font-mono tabular-nums text-foreground">{ingressLatencyMs.toFixed(1)} ms</span>
            </span>
            <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
            <span className="inline-flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 shrink-0 text-sky-600 motion-safe:animate-pulse-slow" strokeWidth={1.75} />
              Ngadda intake flow{' '}
              <span className="font-mono tabular-nums text-foreground">{flowVelocityMs.toFixed(2)} m/s</span>
            </span>
          </div>

          {/* KPI row: expands with sidebar width; equal-height cells */}
          <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-5">
            <div className="min-h-0 min-w-0">
              <MetricCard
                title="Est. flood risk value"
                value={formatCurrency(metrics.floodRiskValue.amount)}
                trend={metrics.floodRiskValue.trend}
                status="critical"
                sparklineData={sparklines.floodRisk}
                sparklineColor="hsl(var(--primary))"
                onClick={() => drill('Water level analytics', '/analytics')}
              />
            </div>
            <div className="min-h-0 min-w-0">
              <MetricCard
                title="Guild Field Reports"
                value={`${metrics.guildFieldReports.activeCount} Active`}
                subtitle={metrics.guildFieldReports.subtitle}
                status="success"
                sparklineData={sparklines.guildFieldReports}
                sparklineColor="hsl(142 76% 36%)"
                onClick={() => drill('Warden field reports', '/field-report')}
              />
            </div>
            <div className="min-h-0 min-w-0">
              <MetricCard
                title="Conflict probability (7d)"
                value={`${metrics.conflictProbability.percentage}% ${metrics.conflictProbability.level.charAt(0).toUpperCase() + metrics.conflictProbability.level.slice(1)}`}
                subtitle={metrics.conflictProbability.location}
                sparklineData={sparklines.conflictProb}
                sparklineColor="#d97706"
                onClick={() => drill('System configuration (CRPD)', '/settings')}
              />
            </div>
            <div className="min-h-0 min-w-0">
              <MetricCard
                title="Safe corridors"
                value={`${metrics.safeCorridors.count} routes`}
                status="success"
                sparklineData={sparklines.corridors}
                sparklineColor="#059669"
                onClick={() =>
                  toast.message('Safe corridors', { description: 'Routes are shown on the situational map below.' })
                }
              />
            </div>
            <div className="min-h-0 min-w-0 sm:col-span-2 lg:col-span-1">
              {sensorsLoading ? (
                <MetricCardSkeleton />
              ) : (
                <MetricCard
                  title={`${edgeHardwareSpec.mcuFamily} · LiFePO₄`}
                  value={`${sensorStats.avgBatteryVoltage.toFixed(2)} V`}
                  subtitle={`${edgeHardwareSpec.ultrasonicModel} · ${sensorStats.lowBattery} low · ${sensorStats.hydroCritical} crit`}
                  status={edgeCardStatus}
                  sparklineData={edgeSparkline}
                  sparklineColor="#0284c7"
                  onClick={() => drill('Sensor network', '/sensors')}
                />
              )}
            </div>
          </div>

          {/* Map + dispatch: share remaining height; each scrolls internally */}
          {sensorsLoading ? (
            <DashboardMapAndDispatchSkeleton />
          ) : (
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
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
