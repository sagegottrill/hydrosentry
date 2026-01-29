import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { CrisisMap } from '@/components/dashboard/CrisisMap';
import { SeasonToggle } from '@/components/dashboard/SeasonToggle';
import { ActionDispatcher } from '@/components/dashboard/ActionDispatcher';
import { useHydroData, useAlerts } from '@/hooks/useHydroData';
import { useToast } from '@/hooks/use-toast';
import type { Season } from '@/types/hydrosentry';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();
  
  const { 
    season, 
    setSeason, 
    riskZones, 
    boreholes, 
    routes, 
    metrics,
    sparklineData 
  } = useHydroData();
  
  const { alerts, dispatchAction } = useAlerts();

  // Handle forced season from URL
  useEffect(() => {
    const forcedSeason = searchParams.get('season') as Season | null;
    if (forcedSeason && (forcedSeason === 'wet' || forcedSeason === 'dry')) {
      setSeason(forcedSeason);
    }
  }, [searchParams, setSeason]);

  // Filter alerts by current season
  const seasonAlerts = alerts.filter(a => a.season === season);

  const handleDispatch = (alertId: string, actionType: string) => {
    const result = dispatchAction(alertId);
    
    if (result.success) {
      toast({
        title: "✓ Work Order Dispatched",
        description: result.message,
        className: "bg-success text-success-foreground border-success",
      });
    }
  };

  const handleMapDispatch = (type: string, id: string) => {
    const workOrderNumber = Math.floor(400 + Math.random() * 100);
    toast({
      title: "✓ Work Order Dispatched",
      description: `Work Order #${workOrderNumber} Sent to Ministry of Environment`,
      className: "bg-success text-success-foreground border-success",
    });
  };

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
    <div className="flex h-screen bg-secondary/30 overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Metric Cards Row */}
        <div className="p-4 pb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Est. Flood Risk Value"
              value={formatCurrency(metrics.floodRiskValue.amount)}
              trend={metrics.floodRiskValue.trend}
              sparklineData={sparklineData.floodRisk}
              sparklineColor="hsl(0 84% 60%)"
            />
            <MetricCard
              title="Active Borehole Failures"
              value={`${metrics.boreholeFailures.count} Sites`}
              status={metrics.boreholeFailures.status === 'stable' ? 'neutral' : metrics.boreholeFailures.status}
              sparklineData={sparklineData.boreholeFailures}
              sparklineColor="hsl(38 92% 50%)"
            />
            <MetricCard
              title="Conflict Probability (7-Day)"
              value={`${metrics.conflictProbability.percentage}% ${metrics.conflictProbability.level.charAt(0).toUpperCase() + metrics.conflictProbability.level.slice(1)}`}
              subtitle={metrics.conflictProbability.location}
              sparklineData={sparklineData.conflictProb}
              sparklineColor="hsl(38 92% 50%)"
            />
            <MetricCard
              title="Safe Corridors Active"
              value={`${metrics.safeCorridors.count} Routes`}
              status="success"
              sparklineData={sparklineData.corridors}
              sparklineColor="hsl(142 76% 36%)"
            />
          </div>
        </div>

        {/* Map & Dispatcher Row */}
        <div className="flex-1 p-4 pt-2 flex gap-4 min-h-0">
          {/* Map Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Season Toggle - positioned above map */}
            <div className="flex justify-center mb-3">
              <SeasonToggle season={season} onSeasonChange={setSeason} />
            </div>
            
            {/* Map */}
            <div className="flex-1 min-h-0">
              <CrisisMap
                season={season}
                riskZones={riskZones}
                boreholes={boreholes}
                routes={routes}
                onDispatch={handleMapDispatch}
              />
            </div>
          </div>

          {/* Action Dispatcher Panel */}
          <div className="w-80 flex-shrink-0">
            <ActionDispatcher 
              alerts={seasonAlerts} 
              onDispatch={handleDispatch} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
