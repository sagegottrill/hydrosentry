/**
 * Ambient “live” telemetry helpers — small bounded steps for charts/metrics.
 * Intervals using these should be ≥ 2000ms (see hooks/pages).
 */

import type { ReadingPoint } from '@/hooks/useSensorNetwork';

export const TELEMETRY_CHART_TICK_MS = 3000;
export const TELEMETRY_METRIC_TICK_MS = 2800;

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Ultrasonic clearance (cm): small physical step per tick. */
export function nextWaterClearanceCm(prev: number, maxDelta = 0.45): number {
  const delta = (Math.random() * 2 - 1) * maxDelta;
  return clamp(prev + delta, 35, 520);
}

/** Generic series (risk %, counts, etc.): ±maxPct of previous value (default 1% “living app”). */
export function nextPercentDrift(prev: number, maxPct = 0.01): number {
  const factor = 1 + (Math.random() * 2 - 1) * maxPct;
  return Math.round(prev * factor * 1000) / 1000;
}

/** LiFePO₄ rail: drift down or nearly flat (no charging simulation here). */
export function nextBatterySample(prev: number): number {
  if (prev <= 0) return prev;
  const roll = Math.random();
  if (roll < 0.6) return clamp(prev - Math.random() * 0.0022, 3.0, 3.65);
  return clamp(prev + (Math.random() - 0.5) * 0.0006, 3.0, 3.65);
}

/** Walk latency in [lo, hi] ms — ±1% multiplicative jitter (ambient hum). */
export function nextLatencyMs(prev: number, lo = 12, hi = 18): number {
  const factor = 1 + (Math.random() * 2 - 1) * 0.01;
  return Math.round(clamp(prev * factor, lo, hi) * 10) / 10;
}

/** Flow scalar in [lo, hi] m/s — ±1% multiplicative jitter. */
export function nextFlowVelocity(prev: number, lo = 1.2, hi = 1.4): number {
  const factor = 1 + (Math.random() * 2 - 1) * 0.01;
  return Math.round(clamp(prev * factor, lo, hi) * 100) / 100;
}

export function appendReadingPoint(prev: ReadingPoint[], value: number, maxLen: number): ReadingPoint[] {
  const at = Date.now();
  const time = new Date(at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const v = Math.round(value * 100) / 100;
  const next = [...prev, { at, time, value: v }];
  return next.length > maxLen ? next.slice(-maxLen) : next;
}

export function syntheticWaterHistory(baseCm: number, points: number, stepMs = 120_000): ReadingPoint[] {
  const now = Date.now();
  const base = Number.isFinite(baseCm) && baseCm > 0 ? baseCm : 200;
  return Array.from({ length: points }, (_, i) => {
    const at = now - (points - 1 - i) * stepMs;
    return {
      at,
      time: new Date(at).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      value: Math.round((base + (Math.random() - 0.5) * 0.35) * 100) / 100,
    };
  });
}

export type DayPoint = { day: number; value: number };

/** Shift sparkline window: drop oldest, append perturbed tail (days stay 1..n). */
export function shiftSparklineSeries(prev: DayPoint[], nextValue: number): DayPoint[] {
  if (prev.length === 0) return [{ day: 1, value: nextValue }];
  const rest = prev.slice(1).map((p, idx) => ({ day: idx + 1, value: p.value }));
  rest.push({ day: prev.length, value: nextValue });
  return rest;
}
