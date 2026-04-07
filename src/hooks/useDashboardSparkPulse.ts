import { useEffect, useState } from 'react';
import {
  nextBatterySample,
  nextFlowVelocity,
  nextLatencyMs,
  nextPercentDrift,
  shiftSparklineSeries,
  TELEMETRY_CHART_TICK_MS,
  TELEMETRY_METRIC_TICK_MS,
  type DayPoint,
} from '@/lib/telemetryPulse';
import { sparklineData as staticSparklines } from '@/hooks/useHydroData';

export interface DashboardSparkPulse {
  floodRisk: DayPoint[];
  guildFieldReports: DayPoint[];
  conflictProb: DayPoint[];
  corridors: DayPoint[];
}

function cloneInitial(): DashboardSparkPulse {
  return {
    floodRisk: staticSparklines.floodRisk.map((p) => ({ ...p })),
    guildFieldReports: staticSparklines.guildFieldReports.map((p) => ({ ...p })),
    conflictProb: staticSparklines.conflictProb.map((p) => ({ ...p })),
    corridors: staticSparklines.corridors.map((p) => ({ ...p })),
  };
}

/**
 * Sliding-window sparklines for overview KPI cards + ambient ingress metrics.
 * Chart tick ≥3s; metric tick ≥2.8s (guardrails).
 */
export function useDashboardSparkPulse(avgBatteryVoltage: number) {
  const [sparklines, setSparklines] = useState<DashboardSparkPulse>(cloneInitial);
  const [ingressLatencyMs, setIngressLatencyMs] = useState(14.2);
  const [flowVelocityMs, setFlowVelocityMs] = useState(1.28);

  const [edgeSparkline, setEdgeSparkline] = useState<DayPoint[]>(() =>
    [1, 2, 3, 4, 5, 6, 7].map((day) => ({
      day,
      value: Math.min(3.2, 2.92 + day * 0.035 + (avgBatteryVoltage - 3.05) * 0.2),
    })),
  );

  useEffect(() => {
    setEdgeSparkline(
      [1, 2, 3, 4, 5, 6, 7].map((day) => ({
        day,
        value: Math.min(3.2, 2.92 + day * 0.035 + (avgBatteryVoltage - 3.05) * 0.2),
      })),
    );
  }, [avgBatteryVoltage]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSparklines((s) => {
        const lastF = s.floodRisk[s.floodRisk.length - 1]?.value ?? 28;
        const lastG = s.guildFieldReports[s.guildFieldReports.length - 1]?.value ?? 14;
        const lastC = s.conflictProb[s.conflictProb.length - 1]?.value ?? 86;
        const lastR = s.corridors[s.corridors.length - 1]?.value ?? 12;
        return {
          floodRisk: shiftSparklineSeries(s.floodRisk, nextPercentDrift(lastF, 0.01)),
          guildFieldReports: shiftSparklineSeries(s.guildFieldReports, clampCountDrift(lastG)),
          conflictProb: shiftSparklineSeries(s.conflictProb, nextPercentDrift(lastC, 0.01)),
          corridors: shiftSparklineSeries(s.corridors, clampCountDrift(lastR)),
        };
      });

      setEdgeSparkline((prev) => {
        const last = prev[prev.length - 1]?.value ?? 3.2;
        return shiftSparklineSeries(prev, nextBatterySample(last));
      });
    }, TELEMETRY_CHART_TICK_MS);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIngressLatencyMs((v) => nextLatencyMs(v));
      setFlowVelocityMs((v) => nextFlowVelocity(v));
    }, TELEMETRY_METRIC_TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  return { sparklines, edgeSparkline, ingressLatencyMs, flowVelocityMs };
}

function clampCountDrift(prev: number): number {
  const n = nextPercentDrift(prev, 0.01);
  return Math.max(0, Math.round(n * 10) / 10);
}
