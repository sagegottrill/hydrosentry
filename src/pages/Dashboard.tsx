import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { CrisisMap } from '@/components/dashboard/CrisisMap';
import { SeasonToggle } from '@/components/dashboard/SeasonToggle';
import { ActionDispatcher } from '@/components/dashboard/ActionDispatcher';
import { useHydroData, useAlerts } from '@/hooks/useHydroData';
import { useToast } from '@/hooks/use-toast';
import type { Season } from '@/types/hydrosentry';

import { motion, type Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 80, damping: 20 }
  }
};

export default function Dashboard() {
  const [searchParams] = useSearchParams();
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
        title: "✓ Action Dispatched",
        description: result.message,
        className: "bg-[#005587] text-white border-[#005587] shadow-lg",
      });
    }
  };

  const handleMapDispatch = (type: string, id: string) => {
    const workOrderNumber = Math.floor(400 + Math.random() * 100);
    toast({
      title: "✓ Command Order Dispatched",
      description: `Directive #${workOrderNumber} sent to field personnel`,
      className: "bg-[#005587] text-white border-[#005587] shadow-lg",
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
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8 px-6 space-y-6">
        <motion.div
          className="flex flex-col min-w-0"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Title Section for Dashboard */}
          <motion.div variants={itemVariants} className="pb-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Global Overview</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Live Telemetry & Analytics</p>
          </motion.div>

          {/* Metric Cards Row */}
          <motion.div variants={itemVariants} className="px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div variants={itemVariants} className="hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <MetricCard
                  title="Est. Flood Risk Value"
                  value={formatCurrency(metrics.floodRiskValue.amount)}
                  trend={metrics.floodRiskValue.trend}
                  sparklineData={sparklineData.floodRisk}
                  sparklineColor="#005587"
                />
              </motion.div>
              <motion.div variants={itemVariants} className="hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <MetricCard
                  title="Active Borehole Failures"
                  value={`${metrics.boreholeFailures.count} Sites`}
                  status={metrics.boreholeFailures.status === 'stable' ? 'neutral' : metrics.boreholeFailures.status}
                  sparklineData={sparklineData.boreholeFailures}
                  sparklineColor="#f59e0b"
                />
              </motion.div>
              <motion.div variants={itemVariants} className="hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <MetricCard
                  title="Conflict Probability (7-Day)"
                  value={`${metrics.conflictProbability.percentage}% ${metrics.conflictProbability.level.charAt(0).toUpperCase() + metrics.conflictProbability.level.slice(1)}`}
                  subtitle={metrics.conflictProbability.location}
                  sparklineData={sparklineData.conflictProb}
                  sparklineColor="#f59e0b"
                />
              </motion.div>
              <motion.div variants={itemVariants} className="hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <MetricCard
                  title="Safe Corridors Active"
                  value={`${metrics.safeCorridors.count} Routes`}
                  status="success"
                  sparklineData={sparklineData.corridors}
                  sparklineColor="#10b981"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Map & Dispatcher Row */}
          <motion.div variants={itemVariants} className="px-8 flex flex-col lg:flex-row gap-8 items-start relative">
            {/* Map Area - Sticky Section */}
            <div className="flex-1 w-full lg:sticky lg:top-6 flex flex-col bg-white rounded-2xl shadow-soft p-6 hover:shadow-lifted transition-all duration-500 h-[calc(100vh-3rem)] min-h-[600px] ease-premium group z-10">
              {/* Season Toggle - positioned above map */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Geospatial Operations Map</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time situational awareness</p>
                </div>
                <SeasonToggle season={season} onSeasonChange={setSeason} />
              </div>

              {/* Map */}
              <div className="flex-1 min-h-[500px] rounded-xl overflow-hidden shadow-inner bg-slate-50">
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
            <div className="w-full lg:w-[420px] flex-shrink-0">
              <ActionDispatcher
                alerts={seasonAlerts}
                onDispatch={handleDispatch}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
